import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get marketplace listings
 */
export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { totalRedemptions: 'desc' },
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get listing by ID
 */
export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redeem Charity Coins for item
 */
export const redeemItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { listingId, quantity = 1, deliveryPhone } = req.body;

    // Get listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
    }

    if (!listing.isActive || !listing.isInStock) {
      throw new AppError('Item not available', 400, 'ITEM_NOT_AVAILABLE');
    }

    // Calculate total cost
    const totalCoins = listing.coinPrice * quantity;

    // Check user's Charity Coins balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { charityCoinsBalance: true },
    });

    if (!user || user.charityCoinsBalance < totalCoins) {
      throw new AppError('Insufficient Charity Coins', 400, 'INSUFFICIENT_COINS', {
        required: totalCoins,
        available: user?.charityCoinsBalance || 0,
      });
    }

    // Create redemption and update balances
    const redemption = await prisma.$transaction(async (tx) => {
      // Create redemption
      const r = await tx.redemption.create({
        data: {
          userId,
          listingId,
          coinsSpent: totalCoins,
          realValue: listing.realValue * quantity,
          status: 'pending',
          deliveryMethod: 'instant',
          deliveryData: deliveryPhone ? { phone: deliveryPhone } : undefined,
        },
      });

      // Deduct coins from user
      await tx.user.update({
        where: { id: userId },
        data: {
          charityCoinsBalance: { decrement: totalCoins },
        },
      });

      // Update listing stats
      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: {
          totalRedemptions: { increment: 1 },
          stockQuantity: { decrement: quantity },
        },
      });

      return r;
    });

    logger.info(`Redemption created: ${redemption.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        redemptionId: redemption.id,
        coinsSpent: totalCoins,
        status: 'processing',
        estimatedDelivery: 'Instant',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get redemption history
 */
export const getRedemptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, offset = 0 } = req.query;

    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
        where: { userId },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          listing: true,
        },
      }),
      prisma.redemption.count({ where: { userId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        redemptions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
