import { Job } from 'bull';
import logger from '../utils/logger';
import { cancelExpiredCoinPurchases } from '../controllers/coinPurchase.controller';

/**
 * Cancel expired coin purchase escrows
 * Runs: Every 10 minutes
 */
export async function processCoinEscrowExpiration(job: Job) {
  logger.info('Starting coin escrow expiration check...');

  try {
    const expired = await cancelExpiredCoinPurchases();

    logger.info(`Coin escrow expiration check complete: ${expired} transactions expired`);
    return { expired };
  } catch (error) {
    logger.error('Coin escrow expiration check failed:', error);
    throw error;
  }
}
