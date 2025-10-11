import { Job } from 'bull';
import { sendMissionReminders, sendStreakAlerts } from './gamification-reminders.job';
import logger from '../utils/logger';

/**
 * Process gamification job
 */
export async function processGamificationJob(job: Job) {
  try {
    const { time } = job.data;

    if (time === 'evening' || time === 'night') {
      // Mission reminders
      await sendMissionReminders(time);
    } else {
      // Streak protection alerts
      await sendStreakAlerts();
    }

    logger.info(`✅ Gamification job completed: ${job.name}`);
  } catch (error) {
    logger.error('Error processing gamification job:', error);
    throw error;
  }
}
