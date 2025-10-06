import pushNotificationService from '../services/pushNotificationService';

/**
 * Helper functions for sending local notifications
 */

export const notificationHelper = {
  /**
   * Send a local notification for donation received
   */
  async notifyDonationReceived(amount: number, fromUser: string) {
    await pushNotificationService.scheduleLocalNotification(
      '💰 Donation Received!',
      `You received ₦${amount.toLocaleString()} from ${fromUser}`,
      {
        type: 'donation',
        amount,
        fromUser,
      }
    );
  },

  /**
   * Send a local notification for achievement unlocked
   */
  async notifyAchievementUnlocked(achievementName: string) {
    await pushNotificationService.scheduleLocalNotification(
      '🏆 Achievement Unlocked!',
      `You've unlocked: ${achievementName}`,
      {
        type: 'achievement',
        achievementName,
      }
    );
  },

  /**
   * Send a local notification for level up
   */
  async notifyLevelUp(newLevel: number) {
    await pushNotificationService.scheduleLocalNotification(
      '⬆️ Level Up!',
      `Congratulations! You've reached Level ${newLevel}`,
      {
        type: 'level_up',
        newLevel,
      }
    );
  },

  /**
   * Send a local notification for streak reminder
   */
  async notifyStreakReminder(streakCount: number) {
    await pushNotificationService.scheduleLocalNotification(
      '🔥 Keep Your Streak!',
      `You're on a ${streakCount}-day streak! Don't forget to log in today.`,
      {
        type: 'streak',
        streakCount,
      },
      // Schedule for tomorrow morning 9 AM
      3600 * 24 - new Date().getHours() * 3600 + 9 * 3600
    );
  },

  /**
   * Send a local notification for marketplace item redeemed
   */
  async notifyItemRedeemed(itemName: string) {
    await pushNotificationService.scheduleLocalNotification(
      '🎁 Item Redeemed!',
      `Your ${itemName} has been redeemed successfully`,
      {
        type: 'marketplace',
        itemName,
      }
    );
  },

  /**
   * Send a local notification for agent verification
   */
  async notifyAgentVerification(userName: string) {
    await pushNotificationService.scheduleLocalNotification(
      '✅ Verification Request',
      `New verification request from ${userName}`,
      {
        type: 'agent',
        userName,
      }
    );
  },

  /**
   * Send a local notification for coin purchase request
   */
  async notifyCoinPurchaseRequest(amount: number, userName: string) {
    await pushNotificationService.scheduleLocalNotification(
      '💰 Coin Purchase Request',
      `${userName} wants to buy ₦${amount.toLocaleString()} in coins`,
      {
        type: 'agent',
        amount,
        userName,
      }
    );
  },

  /**
   * Send a local notification for cycle due reminder
   */
  async notifyCycleDue(daysRemaining: number) {
    await pushNotificationService.scheduleLocalNotification(
      '⏰ Donation Cycle Due',
      `Your donation cycle is due in ${daysRemaining} days`,
      {
        type: 'cycle',
        daysRemaining,
      },
      // Schedule for tomorrow
      3600 * 24
    );
  },

  /**
   * Send a local notification for payment received
   */
  async notifyPaymentReceived(amount: number, transactionType: string) {
    await pushNotificationService.scheduleLocalNotification(
      '✅ Payment Received',
      `You received ₦${amount.toLocaleString()} - ${transactionType}`,
      {
        type: 'wallet',
        amount,
        transactionType,
      }
    );
  },

  /**
   * Send a local notification for withdrawal completed
   */
  async notifyWithdrawalCompleted(amount: number) {
    await pushNotificationService.scheduleLocalNotification(
      '💸 Withdrawal Completed',
      `₦${amount.toLocaleString()} has been sent to your account`,
      {
        type: 'wallet',
        amount,
      }
    );
  },

  /**
   * Update notification badge count
   */
  async updateBadgeCount(count: number) {
    await pushNotificationService.setBadgeCount(count);
  },

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await pushNotificationService.dismissAllNotifications();
    await pushNotificationService.setBadgeCount(0);
  },
};

export default notificationHelper;
