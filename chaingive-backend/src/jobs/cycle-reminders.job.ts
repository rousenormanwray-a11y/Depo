import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { addDays } from '../utils/date';
import { sendTemplateNotification } from '../services/notification.service';

/**
 * Send cycle due reminders
 * Runs: Daily at 9 AM
 */
export async function processCycleReminders(job: Job) {
  logger.info('Starting cycle reminders job...');

  try {
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);

    // Find cycles due in 7 days
    const upcomingCycles = await prisma.cycle.findMany({
      where: {
        status: 'obligated',
        dueDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Found ${upcomingCycles.length} cycles due in 7 days`);

    for (const cycle of upcomingCycles) {
      try {
        // Send push notification
        await sendTemplateNotification(
          cycle.user.id,
          'CYCLE_DUE_SOON',
          Number(cycle.amount),
          7
        );

      // Send SMS reminder
      const { sendCycleReminderSMS } = await import('../services/sms.service');
      await sendCycleReminderSMS(
        cycle.user.phoneNumber,
        cycle.user.firstName,
        Number(cycle.amount),
        7
      );

      // Send email reminder if available
      if (cycle.user.email) {
        const { sendCycleReminderEmail } = await import('../services/email.service');
        await sendCycleReminderEmail(
          cycle.user.email,
          cycle.user.firstName,
          Number(cycle.amount),
          7
        );
      }

      logger.info(`Reminder sent for cycle ${cycle.id} to user ${cycle.user.id}`);
      } catch (error) {
        logger.error(`Failed to send reminder for cycle ${cycle.id}:`, error);
      }
    }

    // Find overdue cycles (past due date)
    const overdueCycles = await prisma.cycle.findMany({
      where: {
        status: 'obligated',
        dueDate: {
          lt: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    logger.info(`Found ${overdueCycles.length} overdue cycles`);

    // Mark as defaulted and apply trust score penalty
    for (const cycle of overdueCycles) {
      await prisma.$transaction([
        prisma.cycle.update({
          where: { id: cycle.id },
          data: { status: 'defaulted' },
        }),
        prisma.user.update({
          where: { id: cycle.userId },
          data: {
            trustScore: { decrement: 0.10 }, // -0.10 trust score penalty
          },
        }),
      ]);

      logger.info(`Cycle ${cycle.id} marked as defaulted for user ${cycle.user.id}`);
    }

    return {
      reminders: upcomingCycles.length,
      defaulted: overdueCycles.length,
    };
  } catch (error) {
    logger.error('Cycle reminders job failed:', error);
    throw error;
  }
}
