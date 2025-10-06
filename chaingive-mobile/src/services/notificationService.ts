import apiClient from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'donation' | 'achievement' | 'system' | 'marketplace' | 'agent' | 'cycle';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Notification Service
 * Handles all notification-related API calls
 */
export const notificationService = {
  /**
   * Get paginated notifications for the current user
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   */
  async getNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    try {
      const response = await apiClient.get<NotificationResponse>('/notifications', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  /**
   * Mark a specific notification as read
   * @param notificationId - The notification ID to mark as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.post<{ success: boolean; count: number }>(
        '/notifications/mark-all-read'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a specific notification
   * @param notificationId - The notification ID to delete
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/notifications/${notificationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  /**
   * Get the count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        '/notifications/unread-count'
      );
      return response.data.count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  },

  /**
   * Subscribe to push notifications (register device token)
   * @param pushToken - The Expo push notification token
   * @param deviceInfo - Optional device information
   */
  async registerPushToken(
    pushToken: string,
    deviceInfo?: {
      platform?: string;
      model?: string;
      osVersion?: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        '/notifications/register-push',
        { pushToken, deviceInfo }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to register push token:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from push notifications (remove device token)
   * @param pushToken - The Expo push notification token to remove
   */
  async unregisterPushToken(pushToken: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        '/notifications/unregister-push',
        { pushToken }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to unregister push token:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences for the current user
   */
  async getPreferences(): Promise<{
    email: boolean;
    push: boolean;
    sms: boolean;
    types: Record<string, boolean>;
  }> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    types?: Record<string, boolean>;
  }): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.patch<{ success: boolean }>(
        '/notifications/preferences',
        preferences
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },
};

export default notificationService;
