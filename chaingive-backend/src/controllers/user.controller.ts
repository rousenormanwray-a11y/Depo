import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tier: user.tier,
        trustScore: user.trustScore,
        totalCyclesCompleted: user.totalCyclesCompleted,
        totalDonated: user.totalDonated,
        totalReceived: user.totalReceived,
        charityCoinsBalance: user.charityCoinsBalance,
        kycStatus: user.kycStatus,
        preferredLanguage: user.preferredLanguage,
        locationCity: user.locationCity,
        locationState: user.locationState,
        wallet: user.wallet,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const updates = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 */
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [user, sentTransactions, receivedTransactions, cycles] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalCyclesCompleted: true,
          totalDonated: true,
          totalReceived: true,
          charityCoinsBalance: true,
          trustScore: true,
        },
      }),
      prisma.transaction.count({
        where: {
          fromUserId: userId,
          type: 'donation_sent',
          status: 'completed',
        },
      }),
      prisma.transaction.count({
        where: {
          toUserId: userId,
          type: 'donation_sent',
          status: 'completed',
        },
      }),
      prisma.cycle.findMany({
        where: { userId },
        select: {
          status: true,
          daysToFulfill: true,
        },
      }),
    ]);

    const avgCompletionTime =
      cycles
        .filter((c) => c.daysToFulfill !== null)
        .reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / cycles.length || 0;

    res.status(200).json({
      success: true,
      data: {
        totalDonated: user?.totalDonated || 0,
        totalReceived: user?.totalReceived || 0,
        totalCyclesCompleted: user?.totalCyclesCompleted || 0,
        charityCoinsBalance: user?.charityCoinsBalance || 0,
        trustScore: user?.trustScore || 0,
        donationsSent: sentTransactions,
        donationsReceived: receivedTransactions,
        avgCycleCompletionDays: Math.round(avgCompletionTime),
      },
    });
  } catch (error) {
    next(error);
  }
};
