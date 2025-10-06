import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendMonthlySummaryEmail } from '../services/email.service';

/**
 * Generate and send monthly impact digest to all users
 * Runs: 1st day of each month at 10 AM
 * Recipient: All active users
 */
export async function processMonthlyDigest(job: Job) {
  logger.info('Starting monthly digest generation...');

  try {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today);
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        isBanned: false,
        email: { not: null },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    logger.info(`Sending monthly digest to ${users.length} users...`);

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Get user's monthly stats
        const [donations, receipts, cycles, leaderboard] = await Promise.all([
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              fromUserId: user.id,
              status: 'completed',
              createdAt: { gte: lastMonth, lt: thisMonth },
            },
          }),
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
              toUserId: user.id,
              status: 'completed',
              createdAt: { gte: lastMonth, lt: thisMonth },
            },
          }),
          prisma.cycle.count({
            where: {
              userId: user.id,
              status: 'fulfilled',
              fulfilledAt: { gte: lastMonth, lt: thisMonth },
            },
          }),
          prisma.leaderboard.findUnique({
            where: { userId: user.id },
            select: { rank: true },
          }),
        ]);

        // Get total coins (current balance, not just earned this month)
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { charityCoinsBalance: true },
        });

        const stats = {
          totalDonated: Number(donations._sum.amount || 0),
          totalReceived: Number(receipts._sum.amount || 0),
          cyclesCompleted: cycles,
          coinsEarned: userData?.charityCoinsBalance || 0,
          leaderboardRank: leaderboard?.rank || null,
        };

        // Skip if user had no activity this month
        if (stats.totalDonated === 0 && stats.totalReceived === 0 && stats.cyclesCompleted === 0) {
          continue;
        }

        // Send email
        await sendMonthlySummaryEmail(user.email!, user.firstName, stats);
        sent++;

        // Rate limit: pause every 100 emails to avoid spam filters
        if (sent % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause
        }
      } catch (error) {
        logger.error(`Failed to send digest to user ${user.id}:`, error);
        failed++;
      }
    }

    logger.info(`Monthly digest complete: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: users.length };
  } catch (error) {
    logger.error('Monthly digest generation failed:', error);
    throw error;
  }
}
