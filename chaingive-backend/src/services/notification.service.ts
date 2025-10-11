import admin from 'firebase-admin';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

export function initializeFirebase() {
  try {
    // Check if already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (!serviceAccountPath) {
      logger.warn('Firebase service account path not configured. Push notifications disabled.');
      return null;
    }

    // Initialize with service account
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
    });

    logger.info('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  // Donation related
  DONATION_RECEIVED: {
    title: '🎁 Donation Received!',
    body: (amount: number, donor: string) => 
      `You received ₦${amount.toLocaleString()} from ${donor}. Confirm receipt to continue the chain!`,
  },
  DONATION_CONFIRMED: {
    title: '✅ Receipt Confirmed',
    body: (amount: number) => 
      `Your donation of ₦${amount.toLocaleString()} was confirmed. Funds will be released in 48 hours.`,
  },
  ESCROW_RELEASED: {
    title: '💰 Funds Released!',
    body: (amount: number) => 
      `₦${amount.toLocaleString()} is now in your wallet. Time to pay it forward!`,
  },

  // Cycle related
  CYCLE_DUE_SOON: {
    title: '⏰ Cycle Due Soon',
    body: (amount: number, daysLeft: number) => 
      `Your donation of ₦${amount.toLocaleString()} is due in ${daysLeft} days. Ready to give forward?`,
  },
  CYCLE_OVERDUE: {
    title: '⚠️ Cycle Overdue',
    body: (amount: number) => 
      `Your donation of ₦${amount.toLocaleString()} is overdue. Complete it now to maintain your trust score.`,
  },
  CYCLE_COMPLETED: {
    title: '🎉 Cycle Completed!',
    body: (amount: number) => 
      `Great job! You completed your cycle of ₦${amount.toLocaleString()}. Keep the chain going!`,
  },

  // Matching
  MATCH_FOUND: {
    title: '🤝 Match Found!',
    body: (recipient: string, amount: number) => 
      `You've been matched with ${recipient} for ₦${amount.toLocaleString()}. Accept now!`,
  },
  MATCH_ACCEPTED: {
    title: '✅ Match Accepted!',
    body: (donor: string, amount: number) => 
      `${donor} accepted your match for ₦${amount.toLocaleString()}. Payment incoming!`,
  },
  MATCH_REJECTED: {
    title: '❌ Match Declined',
    body: 'Your match was declined. We\'ll find you a new match shortly.',
  },
  MATCH_EXPIRED: {
    title: '⏱️ Match Expired',
    body: 'Your match expired. Create a new donation when ready.',
  },
  MATCH_ACCEPTED: {
    title: '✅ Match Accepted',
    body: (amount: number, recipient: string) => `Your match for ₦${amount.toLocaleString()} was accepted by ${recipient}. Proceed to transfer.`,
  },
  MATCH_REJECTED: {
    title: '❌ Match Rejected',
    body: () => 'Your match request was rejected. We will find a new match soon.',
  },

  // Coins & Leaderboard
  COINS_EARNED: {
    title: '🪙 Charity Coins Earned!',
    body: (coins: number) => 
      `You earned ${coins} Charity Coins! Use them in the marketplace or boost your leaderboard rank.`,
  },
  COINS_PURCHASED: {
    title: '✅ Coins Received',
    body: (coins: number, agent: string) => 
      `${coins.toLocaleString()} Charity Coins added to your account from agent ${agent}.`,
  },
  LEADERBOARD_RANK_UP: {
    title: '📈 You Moved Up!',
    body: (newRank: number, oldRank: number) => 
      `Congrats! You moved from #${oldRank} to #${newRank} on the leaderboard!`,
  },
  BOOST_EXPIRING_SOON: {
    title: '⚡ Boost Expiring',
    body: (boostName: string, hoursLeft: number) => 
      `Your ${boostName} expires in ${hoursLeft} hours. Buy a new one to stay ahead!`,
  },
  BOOST_EXPIRED: {
    title: '⏰ Boost Expired',
    body: (boostName: string) => 
      `Your ${boostName} has expired. Your rank may change after daily update.`,
  },

  // Marketplace
  REDEMPTION_APPROVED: {
    title: '✅ Redemption Approved',
    body: (item: string) => 
      `Your redemption for ${item} has been approved! Check your email for details.`,
  },
  REDEMPTION_REJECTED: {
    title: '❌ Redemption Rejected',
    body: (item: string) => 
      `Your redemption for ${item} was rejected. Coins have been refunded.`,
  },
  PAYMENT_PENDING: {
    title: '⏳ Payment Pending',
    body: (amount: number) => `Payment confirmation pending for ₦${amount.toLocaleString()}.`,
  },
  PAYMENT_REJECTED: {
    title: '❌ Payment Rejected',
    body: () => `Your payment was rejected. Please try again or contact the agent.`,
  },

  // Agent related
  AGENT_COIN_PURCHASE_APPROVED: {
    title: '✅ Coin Purchase Approved',
    body: (coins: number) => 
      `Your purchase of ${coins.toLocaleString()} coins has been approved!`,
  },
  AGENT_COIN_PURCHASE_REJECTED: {
    title: '❌ Purchase Rejected',
    body: (reason: string) => 
      `Your coin purchase was rejected: ${reason}`,
  },
  PAYMENT_PENDING: {
    title: '⏳ Payment Pending',
    body: (amount: number) => 
      `Payment of ₦${amount.toLocaleString()} is pending confirmation. Please verify.`,
  },
  PAYMENT_REJECTED: {
    title: '❌ Payment Rejected',
    body: (amount: number) => 
      `Payment of ₦${amount.toLocaleString()} was rejected. Amount refunded.`,
  },

  // KYC & Verification
  KYC_APPROVED: {
    title: '✅ Verification Complete',
    body: 'Your account has been verified! You can now donate and receive funds.',
  },
  KYC_REJECTED: {
    title: '❌ Verification Failed',
    body: 'Your verification was rejected. Please submit new documents.',
  },

  // Disputes
  DISPUTE_CREATED: {
    title: '🚨 Dispute Created',
    body: (disputeId: string) => 
      `A dispute has been filed for your transaction. Case #${disputeId}`,
  },
  DISPUTE_RESOLVED: {
    title: '✅ Dispute Resolved',
    body: (resolution: string) => 
      `Your dispute has been resolved: ${resolution}`,
  },

  // Gamification
  mission_reminder: {
    title: '🎯 Daily Missions Available',
    body: (missionsLeft: number) => 
      `You have ${missionsLeft} missions left today. Complete them to earn coins!`,
  },
  mission_urgent: {
    title: '⚡ Urgent: Missions Expiring Soon!',
    body: (hoursLeft: number) => 
      `Only ${hoursLeft} hours left to complete your daily missions!`,
  },
  streak_alert: {
    title: '🔥 Don\'t Break Your Streak!',
    body: (streakDays: number) => 
      `Your ${streakDays}-day streak is at risk! Log in today to keep it going.`,
  },
  perfect_day: {
    title: '🌟 Perfect Day Achievement!',
    body: 'You completed all missions today! Bonus coins awarded.',
  },
  achievement_unlocked: {
    title: '🏆 Achievement Unlocked!',
    body: (achievementName: string) => 
      `Congrats! You unlocked: ${achievementName}`,
  },

  // General
  WELCOME: {
    title: '🎉 Welcome to ChainGive!',
    body: 'Start your giving journey today. Complete your profile to begin.',
  },
};

/**
 * Save device token for a user
 */
export async function saveDeviceToken(userId: string, token: string, platform: 'ios' | 'android'): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fcmToken: token,
        devicePlatform: platform,
      },
    });

    logger.info(`Device token saved for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to save device token for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Remove device token
 */
export async function removeDeviceToken(userId: string, token: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fcmToken: null,
        devicePlatform: null,
      },
    });

    logger.info(`Device token removed for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to remove device token for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Send push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    if (!firebaseApp && !initializeFirebase()) {
      logger.warn('Firebase not initialized. Skipping notification.');
      return false;
    }

    // Get user's FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        fcmToken: true,
      },
    });

    if (!user) {
      logger.warn(`User ${userId} not found`);
      return false;
    }

    const fcmToken = user.fcmToken;
    
    if (!fcmToken) {
      logger.info(`No FCM token for user ${userId}. Skipping notification.`);
      return false;
    }

    // Send notification
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'chaingive_notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`Notification sent to user ${userId}:`, response);
    return true;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      // Token is invalid, remove it
      logger.warn(`Invalid FCM token for user ${userId}. Removing...`);
      await removeDeviceToken(userId, '');
    } else {
      logger.error(`Failed to send notification to user ${userId}:`, error);
    }
    return false;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const userId of userIds) {
    const sent = await sendPushNotification(userId, title, body, data);
    if (sent) success++;
    else failed++;
  }

  logger.info(`Bulk notification sent: ${success} success, ${failed} failed`);
  return { success, failed };
}

/**
 * Send notification using template
 */
export async function sendTemplateNotification(
  userId: string,
  template: keyof typeof NotificationTemplates,
  ...args: any[]
): Promise<boolean> {
  const { title, body } = NotificationTemplates[template];
  const bodyText = typeof body === 'function' ? body(...args) : body;

  return sendPushNotification(userId, title, bodyText, {
    template,
    type: 'template',
  });
}

/**
 * Send topic notification (to all users subscribed to a topic)
 */
export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    if (!firebaseApp && !initializeFirebase()) {
      logger.warn('Firebase not initialized. Skipping topic notification.');
      return false;
    }

    const message: admin.messaging.Message = {
      topic,
      notification: {
        title,
        body,
      },
      data,
    };

    const response = await admin.messaging().send(message);
    logger.info(`Topic notification sent to ${topic}:`, response);
    return true;
  } catch (error) {
    logger.error(`Failed to send topic notification to ${topic}:`, error);
    return false;
  }
}

/**
 * Subscribe user to topic
 */
export async function subscribeToTopic(token: string, topic: string): Promise<boolean> {
  try {
    if (!firebaseApp && !initializeFirebase()) {
      return false;
    }

    await admin.messaging().subscribeToTopic([token], topic);
    logger.info(`Token subscribed to topic ${topic}`);
    return true;
  } catch (error) {
    logger.error(`Failed to subscribe to topic ${topic}:`, error);
    return false;
  }
}

// Initialize on module load if in production
if (process.env.NODE_ENV === 'production') {
  initializeFirebase();
}
