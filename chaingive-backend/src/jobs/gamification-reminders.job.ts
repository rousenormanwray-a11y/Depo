import { prisma } from '../utils/prisma';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';
import { sendSMS } from '../services/sms.service';

/**
 * Send reminders for incomplete daily missions
 * Runs daily at 6:00 PM and 11:00 PM
 */

export async function sendMissionReminders(time: 'evening' | 'night') {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find users with incomplete missions
    const incompleteMissions = await prisma.dailyMission.findMany({
      where: {
        date: today,
        allCompleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            phoneNumber: true,
            fcmToken: true,
          },
        },
      },
    });

    logger.info(`Found ${incompleteMissions.length} users with incomplete missions`);

    for (const mission of incompleteMissions) {
      const remaining = [
        !mission.mission1Done,
        !mission.mission2Done,
        !mission.mission3Done,
      ].filter(Boolean).length;

      const potentialCoins = 
        (!mission.mission1Done ? mission.mission1Reward : 0) +
        (!mission.mission2Done ? mission.mission2Reward : 0) +
        (!mission.mission3Done ? mission.mission3Reward : 0) +
        (remaining === 3 ? mission.bonusReward : 0);

      if (time === 'evening') {
        // 6:00 PM - Friendly reminder
        if (mission.user.fcmToken) {
          await sendTemplateNotification(
            mission.user.fcmToken,
            'mission_reminder',
            {
              remaining: remaining.toString(),
              coins: potentialCoins.toString(),
            }
          );
        }
      } else {
        // 11:00 PM - Urgent reminder
        if (remaining > 0) {
          const message = `⏰ Last chance! Complete ${remaining} mission${remaining > 1 ? 's' : ''} before midnight and earn ${potentialCoins} coins! 🪙`;
          
          if (mission.user.fcmToken) {
            await sendTemplateNotification(
              mission.user.fcmToken,
              'mission_urgent',
              { remaining: remaining.toString(), coins: potentialCoins.toString() }
            );
          }
          
          if (mission.user.phoneNumber) {
            await sendSMS(mission.user.phoneNumber, message);
          }
        }
      }
    }

    logger.info(`✅ Sent ${time} mission reminders to ${incompleteMissions.length} users`);
  } catch (error) {
    logger.error('Error sending mission reminders:', error);
  }
}

/**
 * Send streak protection alerts
 * Runs daily at 8:00 PM for users who haven't logged in today
 */

export async function sendStreakAlerts() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find users with active streaks who haven't logged in today
    const streaksAtRisk = await prisma.dailyStreak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastLoginDate: { lt: today },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            phoneNumber: true,
            fcmToken: true,
          },
        },
      },
    });

    logger.info(`Found ${streaksAtRisk.length} streaks at risk`);

    for (const streak of streaksAtRisk) {
      const message = `🔥 Your ${streak.currentStreak}-day streak is at risk! Login before midnight to keep it going! Don't lose your progress! 💪`;
      
      if (streak.user.fcmToken) {
        await sendTemplateNotification(
          streak.user.fcmToken,
          'streak_alert',
          { days: streak.currentStreak.toString() }
        );
      }
      
      if (streak.user.phoneNumber) {
        await sendSMS(streak.user.phoneNumber, message);
      }
    }

    logger.info(`✅ Sent streak alerts to ${streaksAtRisk.length} users`);
  } catch (error) {
    logger.error('Error sending streak alerts:', error);
  }
}

/**
 * Send perfect day celebration
 * Triggered when user closes all rings
 */

export async function sendPerfectDayCelebration(userId: string, coinsAwarded: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        phoneNumber: true,
        fcmToken: true,
      },
    });

    if (!user) return;

    const message = `🎉 PERFECT DAY! You closed all your rings and earned ${coinsAwarded} bonus coins! Amazing work ${user.firstName}! 🎊`;

    if (user.fcmToken) {
      await sendTemplateNotification(
        user.fcmToken,
        'perfect_day',
        { coins: coinsAwarded.toString(), name: user.firstName }
      );
    }

    if (user.phoneNumber) {
      await sendSMS(user.phoneNumber, message);
    }

    logger.info(`✅ Sent perfect day celebration to user ${userId}`);
  } catch (error) {
    logger.error('Error sending perfect day celebration:', error);
  }
}

/**
 * Send achievement unlock notification
 */

export async function sendAchievementUnlock(userId: string, achievementName: string, coinsAwarded: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        phoneNumber: true,
        fcmToken: true,
      },
    });

    if (!user) return;

    const message = `🏆 Achievement Unlocked! "${achievementName}" - You earned ${coinsAwarded} coins! Keep it up ${user.firstName}! 🎉`;

    if (user.fcmToken) {
      await sendTemplateNotification(
        user.fcmToken,
        'achievement_unlocked',
        { achievement: achievementName, coins: coinsAwarded.toString() }
      );
    }

    if (user.phoneNumber) {
      await sendSMS(user.phoneNumber, message);
    }

    logger.info(`✅ Sent achievement unlock notification to user ${userId}`);
  } catch (error) {
    logger.error('Error sending achievement notification:', error);
  }
}
