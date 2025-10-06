import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Import enhanced score calculator from service
import { calculateLeaderboardScore } from '../services/leaderboard.service';

/**
 * Get leaderboard (top 100 users)
 */
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, offset = 0, city } = req.query;

    // Build where clause
    const where: any = {};
    if (city) {
      where.user = { locationCity: city };
    }

    const leaderboard = await prisma.leaderboard.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { totalScore: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            locationCity: true,
            locationState: true,
            charityCoinsBalance: true,
            totalCyclesCompleted: true,
            totalDonated: true,
            trustScore: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's leaderboard position
 */
export const getMyPosition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const userLeaderboard = await prisma.leaderboard.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            locationCity: true,
            charityCoinsBalance: true,
            totalCyclesCompleted: true,
            totalDonated: true,
          },
        },
      },
    });

    if (!userLeaderboard) {
      // User not on leaderboard yet, create entry
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          cycles: {
            where: { status: 'fulfilled' },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Calculate average completion days
      const completedCycles = user.cycles.filter(c => c.daysToFulfill);
      const avgCompletionDays = completedCycles.length > 0
        ? Math.round(
            completedCycles.reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / 
            completedCycles.length
          )
        : 0;

      const score = await calculateLeaderboardScore(user, null, userId);

      const newLeaderboard = await prisma.leaderboard.create({
        data: {
          userId,
          totalDonations: user.totalDonated,
          cyclesCompleted: user.totalCyclesCompleted,
          coinsEarned: user.charityCoinsBalance,
          avgCompletionDays,
          totalScore: score,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              locationCity: true,
              charityCoinsBalance: true,
              totalCyclesCompleted: true,
              totalDonated: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          ...newLeaderboard,
          rank: null,
          message: 'Complete more cycles to get ranked!',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: userLeaderboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available boost options
 */
export const getBoostOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const boostOptions = [
      {
        id: 'multiplier_2x_7d',
        name: '2x Multiplier',
        description: 'Double your leaderboard score for 7 days',
        boostType: 'multiplier',
        boostValue: 2.0,
        duration: 7,
        coinCost: 500,
        icon: '⚡',
      },
      {
        id: 'multiplier_3x_7d',
        name: '3x Multiplier',
        description: 'Triple your leaderboard score for 7 days',
        boostType: 'multiplier',
        boostValue: 3.0,
        duration: 7,
        coinCost: 1000,
        icon: '🚀',
      },
      {
        id: 'visibility_30d',
        name: 'Visibility Boost',
        description: 'Add 1000 points to visibility for 30 days',
        boostType: 'visibility',
        boostValue: 1000,
        duration: 30,
        coinCost: 300,
        icon: '👁️',
      },
      {
        id: 'position_instant',
        name: 'Position Jump',
        description: 'Instantly jump up 5 positions',
        boostType: 'position',
        boostValue: 5,
        duration: null,
        coinCost: 200,
        icon: '⬆️',
      },
      {
        id: 'multiplier_1.5x_30d',
        name: '1.5x Multiplier (Long)',
        description: '1.5x your score for 30 days',
        boostType: 'multiplier',
        boostValue: 1.5,
        duration: 30,
        coinCost: 800,
        icon: '📈',
      },
    ];

    res.status(200).json({
      success: true,
      data: { boosts: boostOptions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Purchase a leaderboard boost
 */
export const purchaseBoost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { boostId } = req.body;

    // Define boost configurations
    const boostConfigs: any = {
      multiplier_2x_7d: {
        boostType: 'multiplier',
        boostValue: 2.0,
        duration: 7,
        coinCost: 500,
      },
      multiplier_3x_7d: {
        boostType: 'multiplier',
        boostValue: 3.0,
        duration: 7,
        coinCost: 1000,
      },
      visibility_30d: {
        boostType: 'visibility',
        boostValue: 1000,
        duration: 30,
        coinCost: 300,
      },
      position_instant: {
        boostType: 'position',
        boostValue: 5,
        duration: null,
        coinCost: 200,
      },
      multiplier_1_5x_30d: {
        boostType: 'multiplier',
        boostValue: 1.5,
        duration: 30,
        coinCost: 800,
      },
    };

    const config = boostConfigs[boostId];
    if (!config) {
      throw new AppError('Invalid boost ID', 400, 'INVALID_BOOST');
    }

    // Check user's coin balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { charityCoinsBalance: true },
    });

    if (!user || user.charityCoinsBalance < config.coinCost) {
      throw new AppError('Insufficient Charity Coins', 400, 'INSUFFICIENT_COINS', {
        required: config.coinCost,
        available: user?.charityCoinsBalance || 0,
      });
    }

    // Get or create leaderboard entry
    let leaderboard = await prisma.leaderboard.findUnique({
      where: { userId },
    });

    if (!leaderboard) {
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          cycles: {
            where: { status: 'fulfilled' },
          },
        },
      });

      const completedCycles = userData!.cycles.filter(c => c.daysToFulfill);
      const avgCompletionDays = completedCycles.length > 0
        ? Math.round(
            completedCycles.reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / 
            completedCycles.length
          )
        : 0;

      leaderboard = await prisma.leaderboard.create({
        data: {
          userId,
          totalDonations: userData!.totalDonated,
          cyclesCompleted: userData!.totalCyclesCompleted,
          coinsEarned: userData!.charityCoinsBalance,
          avgCompletionDays,
          totalScore: 0,
        },
      });
    }

    // Calculate expiration date
    const expiresAt = config.duration 
      ? new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000)
      : null;

    // Deactivate old boosts of same type (can't stack)
    if (config.boostType === 'multiplier' || config.boostType === 'visibility') {
      await prisma.leaderboardBoost.updateMany({
        where: {
          userId,
          leaderboardId: leaderboard.id,
          boostType: config.boostType,
          isActive: true,
        },
        data: { isActive: false },
      });
    }

    // Create boost and deduct coins
    const [boost] = await prisma.$transaction([
      // Create boost
      prisma.leaderboardBoost.create({
        data: {
          userId,
          leaderboardId: leaderboard.id,
          boostType: config.boostType,
          coinsSpent: config.coinCost,
          boostValue: config.boostValue,
          duration: config.duration,
          expiresAt,
          isActive: true,
        },
      }),
      // Deduct coins
      prisma.user.update({
        where: { id: userId },
        data: {
          charityCoinsBalance: { decrement: config.coinCost },
        },
      }),
      // Update leaderboard boost values
      prisma.leaderboard.update({
        where: { id: leaderboard.id },
        data: {
          [config.boostType === 'multiplier' ? 'multiplierBoost' : 
           config.boostType === 'visibility' ? 'visibilityBoost' : 
           'positionBoost']: config.boostValue,
        },
      }),
    ]);

    // Recalculate score
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    const newScore = await calculateLeaderboardScore(updatedUser, {
      multiplierBoost: config.boostType === 'multiplier' ? config.boostValue : leaderboard.multiplierBoost,
      visibilityBoost: config.boostType === 'visibility' ? config.boostValue : leaderboard.visibilityBoost,
      positionBoost: config.boostType === 'position' ? config.boostValue : leaderboard.positionBoost,
    }, userId);

    await prisma.leaderboard.update({
      where: { id: leaderboard.id },
      data: { totalScore: newScore },
    });

    logger.info(`User ${userId} purchased boost: ${boostId}`);

    res.status(201).json({
      success: true,
      message: 'Boost activated successfully',
      data: {
        boost,
        newCoinBalance: user.charityCoinsBalance - config.coinCost,
        newScore,
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's active boosts
 */
export const getActiveBoosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const boosts = await prisma.leaderboardBoost.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { boosts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get city rankings
 */
export const getCityLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city } = req.params;
    const { limit = 50 } = req.query;

    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        user: {
          locationCity: city,
        },
      },
      take: Number(limit),
      orderBy: { totalScore: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            charityCoinsBalance: true,
            totalCyclesCompleted: true,
            totalDonated: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        city,
        leaderboard,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
