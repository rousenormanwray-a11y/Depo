import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Calculate leaderboard score for a user
 */
export function calculateLeaderboardScore(userData: any, boosts: any): number {
  // Base score components (weighted)
  const donationScore = Number(userData.totalDonated || 0) * 0.4;
  const cycleScore = (userData.totalCyclesCompleted || 0) * 100 * 0.3;
  const coinScore = (userData.charityCoinsBalance || 0) * 10 * 0.2;
  
  // Speed bonus (faster completion = higher score)
  // Max bonus: 30 days or less = 1500 points
  const avgDays = userData.avgCompletionDays || 30;
  const speedBonus = Math.max(0, (30 - avgDays) * 50) * 0.1;

  const baseScore = donationScore + cycleScore + coinScore + speedBonus;

  // Apply active boosts
  const multiplier = Number(boosts?.multiplierBoost || 1.0);
  const visibility = Number(boosts?.visibilityBoost || 0);
  const position = Number(boosts?.positionBoost || 0);

  return (baseScore * multiplier) + visibility + position;
}

/**
 * Recalculate leaderboard for all users
 * Should be run daily via cron job
 */
export async function recalculateAllLeaderboards(): Promise<void> {
  try {
    logger.info('Starting leaderboard recalculation...');

    // Get all users with their cycle data
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        isBanned: false,
      },
      include: {
        cycles: {
          where: { status: 'fulfilled' },
        },
        leaderboard: {
          include: {
            boosts: {
              where: {
                isActive: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } },
                ],
              },
            },
          },
        },
      },
    });

    logger.info(`Recalculating scores for ${users.length} users`);

    // Update each user's leaderboard entry
    for (const user of users) {
      // Calculate average completion days
      const completedCycles = user.cycles.filter(c => c.daysToFulfill !== null);
      const avgCompletionDays = completedCycles.length > 0
        ? Math.round(
            completedCycles.reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / 
            completedCycles.length
          )
        : 0;

      // Get current active boosts
      const currentBoosts = user.leaderboard?.boosts || [];
      const multiplierBoost = currentBoosts.find(b => b.boostType === 'multiplier')?.boostValue || 1.0;
      const visibilityBoost = currentBoosts.find(b => b.boostType === 'visibility')?.boostValue || 0;
      const positionBoost = currentBoosts.find(b => b.boostType === 'position')?.boostValue || 0;

      // Calculate new score
      const newScore = calculateLeaderboardScore(
        {
          totalDonated: user.totalDonated,
          totalCyclesCompleted: user.totalCyclesCompleted,
          charityCoinsBalance: user.charityCoinsBalance,
          avgCompletionDays,
        },
        {
          multiplierBoost,
          visibilityBoost,
          positionBoost,
        }
      );

      // Upsert leaderboard entry
      await prisma.leaderboard.upsert({
        where: { userId: user.id },
        update: {
          totalDonations: user.totalDonated,
          cyclesCompleted: user.totalCyclesCompleted,
          coinsEarned: user.charityCoinsBalance,
          avgCompletionDays,
          multiplierBoost,
          visibilityBoost,
          positionBoost,
          totalScore: newScore,
        },
        create: {
          userId: user.id,
          totalDonations: user.totalDonated,
          cyclesCompleted: user.totalCyclesCompleted,
          coinsEarned: user.charityCoinsBalance,
          avgCompletionDays,
          multiplierBoost,
          visibilityBoost,
          positionBoost,
          totalScore: newScore,
        },
      });
    }

    // Assign ranks based on scores
    const rankedLeaderboard = await prisma.leaderboard.findMany({
      orderBy: { totalScore: 'desc' },
    });

    for (let i = 0; i < rankedLeaderboard.length; i++) {
      await prisma.leaderboard.update({
        where: { id: rankedLeaderboard[i].id },
        data: { rank: i + 1 },
      });
    }

    logger.info(`Leaderboard recalculation complete. Updated ${users.length} users.`);
  } catch (error) {
    logger.error('Leaderboard recalculation failed:', error);
    throw error;
  }
}

/**
 * Expire old boosts
 * Should be run hourly via cron job
 */
export async function expireOldBoosts(): Promise<void> {
  try {
    const result = await prisma.leaderboardBoost.updateMany({
      where: {
        isActive: true,
        expiresAt: {
          not: null,
          lt: new Date(),
        },
      },
      data: {
        isActive: false,
      },
    });

    if (result.count > 0) {
      logger.info(`Expired ${result.count} leaderboard boosts`);
      
      // Recalculate affected users
      await recalculateAllLeaderboards();
    }
  } catch (error) {
    logger.error('Failed to expire boosts:', error);
    throw error;
  }
}

/**
 * Update user's leaderboard entry after completing a cycle
 */
export async function updateLeaderboardAfterCycle(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cycles: {
          where: { status: 'fulfilled' },
        },
        leaderboard: {
          include: {
            boosts: {
              where: {
                isActive: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } },
                ],
              },
            },
          },
        },
      },
    });

    if (!user) return;

    const completedCycles = user.cycles.filter(c => c.daysToFulfill !== null);
    const avgCompletionDays = completedCycles.length > 0
      ? Math.round(
          completedCycles.reduce((sum, c) => sum + (c.daysToFulfill || 0), 0) / 
          completedCycles.length
        )
      : 0;

    const currentBoosts = user.leaderboard?.boosts || [];
    const multiplierBoost = currentBoosts.find(b => b.boostType === 'multiplier')?.boostValue || 1.0;
    const visibilityBoost = currentBoosts.find(b => b.boostType === 'visibility')?.boostValue || 0;
    const positionBoost = currentBoosts.find(b => b.boostType === 'position')?.boostValue || 0;

    const newScore = calculateLeaderboardScore(
      {
        totalDonated: user.totalDonated,
        totalCyclesCompleted: user.totalCyclesCompleted,
        charityCoinsBalance: user.charityCoinsBalance,
        avgCompletionDays,
      },
      { multiplierBoost, visibilityBoost, positionBoost }
    );

    await prisma.leaderboard.upsert({
      where: { userId: user.id },
      update: {
        totalDonations: user.totalDonated,
        cyclesCompleted: user.totalCyclesCompleted,
        coinsEarned: user.charityCoinsBalance,
        avgCompletionDays,
        totalScore: newScore,
      },
      create: {
        userId: user.id,
        totalDonations: user.totalDonated,
        cyclesCompleted: user.totalCyclesCompleted,
        coinsEarned: user.charityCoinsBalance,
        avgCompletionDays,
        multiplierBoost,
        visibilityBoost,
        positionBoost,
        totalScore: newScore,
      },
    });

    logger.info(`Updated leaderboard for user ${userId}, new score: ${newScore}`);
  } catch (error) {
    logger.error(`Failed to update leaderboard for user ${userId}:`, error);
  }
}
