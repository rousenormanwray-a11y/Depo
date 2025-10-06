import Bull from 'bull';
import logger from '../utils/logger';

// Redis configuration
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

// Create job queues
export const escrowQueue = new Bull('escrow-release', redisConfig);
export const matchQueue = new Bull('match-expiration', redisConfig);
export const cycleQueue = new Bull('cycle-reminders', redisConfig);
export const leaderboardQueue = new Bull('leaderboard-update', redisConfig);

// Import job processors
import { processEscrowRelease } from './escrow-release.job';
import { processMatchExpiration } from './match-expiration.job';
import { processCycleReminders } from './cycle-reminders.job';
import { processLeaderboardUpdate } from './leaderboard-update.job';

// Register job processors
escrowQueue.process(processEscrowRelease);
matchQueue.process(processMatchExpiration);
cycleQueue.process(processCycleReminders);
leaderboardQueue.process(processLeaderboardUpdate);

// Error handling
escrowQueue.on('failed', (job, err) => {
  logger.error(`Escrow job ${job.id} failed:`, err);
});

matchQueue.on('failed', (job, err) => {
  logger.error(`Match job ${job.id} failed:`, err);
});

cycleQueue.on('failed', (job, err) => {
  logger.error(`Cycle job ${job.id} failed:`, err);
});

leaderboardQueue.on('failed', (job, err) => {
  logger.error(`Leaderboard job ${job.id} failed:`, err);
});

// Success logging
escrowQueue.on('completed', (job) => {
  logger.info(`Escrow job ${job.id} completed`);
});

matchQueue.on('completed', (job) => {
  logger.info(`Match job ${job.id} completed`);
});

cycleQueue.on('completed', (job) => {
  logger.info(`Cycle job ${job.id} completed`);
});

leaderboardQueue.on('completed', (job) => {
  logger.info(`Leaderboard job ${job.id} completed`);
});

// Schedule recurring jobs
export function startScheduledJobs() {
  // Escrow releases - check every hour
  escrowQueue.add(
    'release-escrows',
    {},
    {
      repeat: { cron: '0 * * * *' }, // Every hour
      jobId: 'escrow-release-hourly',
    }
  );

  // Match expiration - check every 6 hours
  matchQueue.add(
    'expire-matches',
    {},
    {
      repeat: { cron: '0 */6 * * *' }, // Every 6 hours
      jobId: 'match-expiration-6hourly',
    }
  );

  // Cycle reminders - daily at 9 AM
  cycleQueue.add(
    'send-reminders',
    {},
    {
      repeat: { cron: '0 9 * * *' }, // 9 AM daily
      jobId: 'cycle-reminders-daily',
    }
  );

  // Leaderboard update - daily at midnight
  leaderboardQueue.add(
    'update-leaderboard',
    {},
    {
      repeat: { cron: '0 0 * * *' }, // Midnight daily
      jobId: 'leaderboard-update-daily',
    }
  );

  logger.info('✅ Scheduled jobs started');
}

export { processEscrowRelease, processMatchExpiration, processCycleReminders, processLeaderboardUpdate };
