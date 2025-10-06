import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Feature Flags Service
 * Enables/disables features without code deployment
 */

// Feature flag names
export enum FeatureFlag {
  DONATIONS = 'donations',
  MARKETPLACE = 'marketplace',
  LEADERBOARD = 'leaderboard',
  REFERRALS = 'referrals',
  DISPUTES = 'disputes',
  COIN_PURCHASES = 'coin_purchases',
  AGENT_NETWORK = 'agent_network',
  KYC_VERIFICATION = 'kyc_verification',
  PUSH_NOTIFICATIONS = 'push_notifications',
  SMS_NOTIFICATIONS = 'sms_notifications',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  FORCE_RECYCLE = 'force_recycle',
  MATCH_EXPIRATION = 'match_expiration',
  ESCROW_RELEASE = 'escrow_release',
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(featureName: string): Promise<boolean> {
  try {
    const feature = await prisma.featureFlag.findUnique({
      where: { featureName },
    });

    // Default to enabled if flag doesn't exist
    return feature?.isEnabled ?? true;
  } catch (error) {
    logger.error(`Failed to check feature flag ${featureName}:`, error);
    // Fail open - allow feature if check fails
    return true;
  }
}

/**
 * Toggle a feature on/off
 */
export async function toggleFeature(
  featureName: string,
  isEnabled: boolean,
  adminId: string
): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { featureName },
    create: {
      featureName,
      isEnabled,
      updatedBy: adminId,
    },
    update: {
      isEnabled,
      updatedBy: adminId,
    },
  });

  logger.info(`Feature ${featureName} ${isEnabled ? 'enabled' : 'disabled'} by admin ${adminId}`);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  return prisma.featureFlag.findMany({
    orderBy: { featureName: 'asc' },
  });
}

/**
 * Initialize default feature flags
 */
export async function initializeFeatureFlags() {
  const defaultFlags = Object.values(FeatureFlag);

  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { featureName: flag },
      create: {
        featureName: flag,
        isEnabled: true,
        description: `Enable/disable ${flag} feature`,
      },
      update: {}, // Don't override existing flags
    });
  }

  logger.info('Feature flags initialized');
}
