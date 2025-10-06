import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { getUserDonationStreak } from '../services/forceRecycle.service';

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tier: true,
        trustScore: true,
        totalCyclesCompleted: true,
        totalDonated: true,
        totalReceived: true,
        charityCoinsBalance: true,
        kycStatus: true,
        locationCity: true,
        locationState: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: user,
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
    const { firstName, lastName, email, locationCity, locationState, preferredLanguage } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(locationCity && { locationCity }),
        ...(locationState && { locationState }),
        ...(preferredLanguage && { preferredLanguage }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        locationCity: true,
        locationState: true,
        preferredLanguage: true,
      },
    });

    logger.info(`User ${userId} updated profile`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
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

    const [user, cycles, wallet, referrals] = await Promise.all([
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
      prisma.cycle.findMany({
        where: { userId },
        select: {
          status: true,
          daysToFulfill: true,
          isSecondDonation: true,
        },
      }),
      prisma.wallet.findUnique({
        where: { userId },
      }),
      prisma.referral.count({
        where: { referrerId: userId },
      }),
    ]);

    const completedCycles = cycles.filter(c => c.status === 'fulfilled');
    const avgCompletionDays = completedCycles.length > 0
      ? Math.round(
          completedCycles.reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / completedCycles.length
        )
      : 0;

    const secondDonations = cycles.filter(c => c.isSecondDonation).length;

    // Get donation streak info
    const streakInfo = await getUserDonationStreak(userId);

    res.status(200).json({
      success: true,
      data: {
        totalCyclesCompleted: user?.totalCyclesCompleted || 0,
        totalDonated: user?.totalDonated || 0,
        totalReceived: user?.totalReceived || 0,
        charityCoinsBalance: user?.charityCoinsBalance || 0,
        trustScore: user?.trustScore || 5.0,
        avgCompletionDays,
        secondDonationsCompleted: secondDonations,
        totalReferrals: referrals,
        wallet: {
          fiatBalance: wallet?.fiatBalance || 0,
          receivableBalance: wallet?.receivableBalance || 0,
          pendingObligations: wallet?.pendingObligations || 0,
        },
        donationStreak: streakInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};
