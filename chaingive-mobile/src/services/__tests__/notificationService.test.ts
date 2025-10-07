import notificationService from '../notificationService';
import apiClient from '../api';

// Mock the API client
jest.mock('../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: '1',
              userId: 'user-1',
              title: 'Test Notification',
              message: 'Test message',
              type: 'system',
              read: false,
              createdAt: '2025-10-06T00:00:00Z',
              updatedAt: '2025-10-06T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          unreadCount: 1,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await notificationService.getNotifications(1, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle errors when fetching notifications', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(notificationService.getNotifications()).rejects.toThrow('Network error');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse = {
        data: {
          id: '1',
          userId: 'user-1',
          title: 'Test',
          message: 'Test',
          type: 'system',
          read: true,
          createdAt: '2025-10-06T00:00:00Z',
          updatedAt: '2025-10-06T00:00:00Z',
        },
      };

      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await notificationService.markAsRead('1');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/notifications/1/read');
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = {
        data: { success: true, count: 5 },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await notificationService.markAllAsRead();

      expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/mark-all-read');
      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = {
        data: { success: true },
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await notificationService.deleteNotification('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/notifications/1');
      expect(result.success).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notification count', async () => {
      const mockResponse = {
        data: { count: 3 },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await notificationService.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(3);
    });
  });

  describe('registerPushToken', () => {
    it('should register push token successfully', async () => {
      const mockResponse = {
        data: { success: true },
      };

      const pushToken = 'ExponentPushToken[xxxxx]';
      const deviceInfo = {
        platform: 'ios',
        model: 'iPhone 13',
        osVersion: '15.0',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await notificationService.registerPushToken(pushToken, deviceInfo);

      expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/register-push', {
        pushToken,
        deviceInfo,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('unregisterPushToken', () => {
    it('should unregister push token successfully', async () => {
      const mockResponse = {
        data: { success: true },
      };

      const pushToken = 'ExponentPushToken[xxxxx]';

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await notificationService.unregisterPushToken(pushToken);

      expect(mockApiClient.post).toHaveBeenCalledWith('/notifications/unregister-push', {
        pushToken,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getPreferences', () => {
    it('should get notification preferences', async () => {
      const mockResponse = {
        data: {
          email: true,
          push: true,
          sms: false,
          types: {
            donation: true,
            achievement: true,
            system: false,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await notificationService.getPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/preferences');
      expect(result.push).toBe(true);
      expect(result.email).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const mockResponse = {
        data: { success: true },
      };

      const preferences = {
        push: false,
        types: {
          donation: false,
        },
      };

      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await notificationService.updatePreferences(preferences);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/notifications/preferences',
        preferences
      );
      expect(result.success).toBe(true);
    });
  });
});
