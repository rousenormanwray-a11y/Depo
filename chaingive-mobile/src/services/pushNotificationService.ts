import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import notificationService from './notificationService';

/**
 * Push Notification Service
 * Handles Expo push notifications setup, permissions, and handlers
 */

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const pushNotificationService = {
  /**
   * Request notification permissions from user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  /**
   * Get the Expo push notification token
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push tokens only work on physical devices');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });

      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Register device for push notifications
   * Gets token and sends it to backend
   */
  async registerDevice(): Promise<{ success: boolean; token?: string }> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false };
      }

      // Get push token
      const pushToken = await this.getExpoPushToken();
      if (!pushToken) {
        return { success: false };
      }

      // Get device info
      const deviceInfo = {
        platform: Platform.OS,
        model: Device.modelName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      };

      // Register with backend
      await notificationService.registerPushToken(pushToken, deviceInfo);

      console.log('Device registered for push notifications');
      return { success: true, token: pushToken };
    } catch (error) {
      console.error('Error registering device:', error);
      return { success: false };
    }
  },

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(): Promise<boolean> {
    try {
      const pushToken = await this.getExpoPushToken();
      if (!pushToken) {
        return false;
      }

      await notificationService.unregisterPushToken(pushToken);
      console.log('Device unregistered from push notifications');
      return true;
    } catch (error) {
      console.error('Error unregistering device:', error);
      return false;
    }
  },

  /**
   * Add listener for when notification is received (app in foreground)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Add listener for when user taps on notification
   */
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    triggerSeconds: number = 1
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: triggerSeconds,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  },

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  },

  /**
   * Dismiss a notification
   */
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  },

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  },

  /**
   * Set notification category (iOS)
   */
  async setNotificationCategories(
    categories: Notifications.NotificationCategory[]
  ): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync(
          categories[0]?.identifier || 'default',
          categories[0]?.actions || []
        );
      }
    } catch (error) {
      console.error('Error setting notification categories:', error);
    }
  },

  /**
   * Configure Android notification channel
   */
  async setAndroidNotificationChannel(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'ChainGive Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('donations', {
          name: 'Donation Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });

        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Achievement Notifications',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#FFD700',
        });

        await Notifications.setNotificationChannelAsync('agent', {
          name: 'Agent Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2196F3',
        });
      }
    } catch (error) {
      console.error('Error setting Android notification channel:', error);
    }
  },

  /**
   * Initialize push notifications
   * Call this on app startup
   */
  async initialize(): Promise<boolean> {
    try {
      // Set up Android channels
      await this.setAndroidNotificationChannel();

      // Register device
      const result = await this.registerDevice();

      return result.success;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  },
};

export default pushNotificationService;
