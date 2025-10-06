import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Check if user qualifies to receive donations
 * Rule: Must complete 2nd donation before receiving again (after 1st receipt)
 */
export async function checkUserQualifiesForReceipt(userId: string): Promise<{
  qualifies: boolean;
  reason?: string;
  pendingCycles: number;
  completedCycles: number;
}> {
  // Get user's cycle history
  const cycles = await prisma.cycle.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const completedCycles = cycles.filter(c => c.status === 'fulfilled').length;
  const receivedCycles = cycles.filter(c => c.receivedAt !== null).length;
  const pendingObligations = cycles.filter(c => c.status === 'obligated').length;

  // First-time user: Always qualifies
  if (receivedCycles === 0) {
    return {
      qualifies: true,
      reason: 'First-time recipient',
      pendingCycles: 0,
      completedCycles: 0,
    };
  }

  // Check for force recycle rule
  // After receiving once, must give twice before receiving again
  const lastReceivedCycle = cycles.filter(c => c.receivedAt !== null).pop();
  
  if (lastReceivedCycle) {
    // Count donations AFTER last receipt
    const donationsAfterReceipt = cycles.filter(
      c => c.fulfilledAt && 
           c.createdAt > lastReceivedCycle.receivedAt! &&
           c.status === 'fulfilled'
    ).length;

    // Need 2 donations after receiving
    if (donationsAfterReceipt < 2) {
      return {
        qualifies: false,
        reason: `Must complete ${2 - donationsAfterReceipt} more donation(s) before receiving again`,
        pendingCycles: 2 - donationsAfterReceipt,
        completedCycles: donationsAfterReceipt,
      };
    }
  }

  // Has pending obligations: Must fulfill first
  if (pendingObligations > 0) {
    return {
      qualifies: false,
      reason: `Complete pending obligation first`,
      pendingCycles: pendingObligations,
      completedCycles,
    };
  }

  // All checks passed
  return {
    qualifies: true,
    reason: 'Qualifies for receipt',
    pendingCycles: 0,
    completedCycles,
  };
}

/**
 * Mark cycle as second donation (for leaderboard boost)
 */
export async function markSecondDonation(userId: string, cycleId: string): Promise<boolean> {
  try {
    // Get user's last received cycle
    const lastReceivedCycle = await prisma.cycle.findFirst({
      where: {
        userId,
        receivedAt: { not: null },
      },
      orderBy: { receivedAt: 'desc' },
    });

    if (!lastReceivedCycle) return false;

    // Count fulfilled donations after last receipt
    const donationsAfterReceipt = await prisma.cycle.count({
      where: {
        userId,
        status: 'fulfilled',
        createdAt: { gt: lastReceivedCycle.receivedAt! },
      },
    });

    // If this is the 2nd donation after receiving, mark it
    if (donationsAfterReceipt === 2) {
      await prisma.cycle.update({
        where: { id: cycleId },
        data: {
          isSecondDonation: true,
          cycleNumber: donationsAfterReceipt,
        },
      });

      logger.info(`Marked cycle ${cycleId} as second donation for user ${userId}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to mark second donation:', error);
    return false;
  }
}

/**
 * Get user's donation streak info
 */
export async function getUserDonationStreak(userId: string): Promise<{
  totalDonations: number;
  donationsAfterLastReceipt: number;
  qualifiesForReceipt: boolean;
  nextMilestone: string;
}> {
  const result = await checkUserQualifiesForReceipt(userId);

  const totalDonations = await prisma.cycle.count({
    where: {
      userId,
      status: 'fulfilled',
    },
  });

  let nextMilestone = 'Complete 2 donations to receive';
  if (result.qualifies) {
    nextMilestone = 'Ready to receive!';
  } else if (result.pendingCycles === 1) {
    nextMilestone = '1 more donation to unlock receipt';
  } else if (result.pendingCycles === 2) {
    nextMilestone = '2 more donations to unlock receipt';
  }

  return {
    totalDonations,
    donationsAfterLastReceipt: result.completedCycles,
    qualifiesForReceipt: result.qualifies,
    nextMilestone,
  };
}

/**
 * Calculate leaderboard bonus for second donations
 */
export async function calculateSecondDonationBonus(userId: string): Promise<number> {
  const secondDonationsCount = await prisma.cycle.count({
    where: {
      userId,
      isSecondDonation: true,
      status: 'fulfilled',
    },
  });

  // Each second donation adds 500 bonus points
  return secondDonationsCount * 500;
}
