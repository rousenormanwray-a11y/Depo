import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import crypto from 'crypto';
import gamificationService from '../services/gamification.service';

/**
 * Generate unique referral code
 */
function generateReferralCode(firstName: string, userId: string): string {
  const namePart = firstName.substring(0, 4).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${namePart}${randomPart}`;
}

/**
 * Get user's referral code and stats
 */
export const getMyReferralCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Check if user already has a referral code
    let userReferralCode = (req.user! as any).referralCode;

    if (!userReferralCode) {
      // Generate new referral code
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true },
      });

      userReferralCode = generateReferralCode(user!.firstName, userId);

      // Store in database (you'll need to add referralCode to User model)
      // For now, we'll generate on-the-fly
    }

    // Get referral stats
    const [totalReferrals, pendingReferrals, completedReferrals, totalCoinsEarned] = await Promise.all([
      prisma.referral.count({
        where: { referrerId: userId },
      }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'pending',
        },
      }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'completed',
        },
      }),
      prisma.referral.aggregate({
        _sum: { coinsEarned: true },
        where: { referrerId: userId },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        referralCode: userReferralCode,
        stats: {
          totalReferrals,
          pendingReferrals,
          completedReferrals,
          totalCoinsEarned: totalCoinsEarned._sum.coinsEarned || 0,
        },
        rewards: {
          perSignup: 25,
          perFirstCycle: 100,
          perCompletion: 300,
        },
        shareMessage: `Join ChainGive and start giving! Use my code: ${userReferralCode}`,
        shareUrl: `https://chaingive.ng/join?ref=${userReferralCode}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get referral history
 */
export const getReferralHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            totalCyclesCompleted: true,
            charityCoinsBalance: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        referrals,
        total: referrals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process referral (called during registration)
 */
export async function processReferral(referralCode: string, newUserId: string): Promise<void> {
  try {
    // Find referrer by code (this is simplified - you'd need to store codes properly)
    // For now, we'll create the referral record when user registers with a code

    // Create referral record
    const referral = await prisma.referral.create({
      data: {
        referrerId: '', // Will be set when we match the code
        referredUserId: newUserId,
        referralCode,
        status: 'registered',
        coinsEarned: 25, // Initial signup bonus
        registeredAt: new Date(),
      },
    });

    // Award 25 coins to referrer
    // await prisma.user.update({
    //   where: { id: referrerId },
    //   data: {
    //     charityCoinsBalance: { increment: 25 },
    //   },
    // });

    logger.info(`Referral processed: ${referralCode} → User ${newUserId}`);
  } catch (error) {
    logger.error('Failed to process referral:', error);
  }
}

/**
 * Update referral status when referred user completes first cycle
 */
export async function updateReferralOnFirstCycle(userId: string): Promise<void> {
  try {
    const referral = await prisma.referral.findFirst({
      where: {
        referredUserId: userId,
        status: 'registered',
      },
    });

    if (referral) {
      await prisma.$transaction([
        // Update referral status
        prisma.referral.update({
          where: { id: referral.id },
          data: {
            status: 'first_cycle',
            firstCycleAt: new Date(),
            coinsEarned: { increment: 100 }, // Bonus for first cycle
          },
        }),
        // Award 100 coins to referrer
        prisma.user.update({
          where: { id: referral.referrerId },
          data: {
            charityCoinsBalance: { increment: 100 },
          },
        }),
      ]);

      logger.info(`Referral updated to first_cycle for user ${userId}`);
    }
  } catch (error) {
    logger.error('Failed to update referral on first cycle:', error);
  }
}

/**
 * Update referral status when referred user completes 3 cycles
 */
export async function updateReferralOnCompletion(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalCyclesCompleted: true },
    });

    if (!user || user.totalCyclesCompleted < 3) return;

    const referral = await prisma.referral.findFirst({
      where: {
        referredUserId: userId,
        status: 'first_cycle',
      },
    });

    if (referral) {
      await prisma.$transaction([
        // Update referral status
        prisma.referral.update({
          where: { id: referral.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            coinsEarned: { increment: 175 }, // Bonus for completion (total: 300)
          },
        }),
        // Award remaining 175 coins to referrer (total 300)
        prisma.user.update({
          where: { id: referral.referrerId },
          data: {
            charityCoinsBalance: { increment: 175 },
          },
        }),
      ]);

      logger.info(`Referral completed for user ${userId}. Referrer earned 300 total coins.`);
    }
  } catch (error) {
    logger.error('Failed to update referral on completion:', error);
  }
}
