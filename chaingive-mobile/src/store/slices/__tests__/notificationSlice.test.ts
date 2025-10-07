import notificationReducer, {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  addNotification,
} from '../notificationSlice';
import { configureStore } from '@reduxjs/toolkit';

describe('notificationSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        notifications: notificationReducer,
      },
    });
  });

  it('should return the initial state', () => {
    const state = store.getState().notifications;
    
    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.page).toBe(1);
    expect(state.hasMore).toBe(true);
  });

  it('should handle clearNotifications', () => {
    store.dispatch(clearNotifications());
    const state = store.getState().notifications;
    
    expect(state.notifications).toEqual([]);
    expect(state.page).toBe(1);
    expect(state.hasMore).toBe(true);
  });

  it('should handle addNotification', () => {
    const notification = {
      id: '1',
      userId: 'user-1',
      title: 'Test',
      message: 'Test message',
      type: 'system' as const,
      read: false,
      createdAt: '2025-10-06T00:00:00Z',
      updatedAt: '2025-10-06T00:00:00Z',
    };

    store.dispatch(addNotification(notification));
    const state = store.getState().notifications;
    
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe('1');
    expect(state.unreadCount).toBe(1);
  });

  it('should not increase unread count for read notifications', () => {
    const notification = {
      id: '1',
      userId: 'user-1',
      title: 'Test',
      message: 'Test message',
      type: 'system' as const,
      read: true,
      createdAt: '2025-10-06T00:00:00Z',
      updatedAt: '2025-10-06T00:00:00Z',
    };

    store.dispatch(addNotification(notification));
    const state = store.getState().notifications;
    
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(0);
  });

  describe('fetchNotifications', () => {
    it('should handle pending state', () => {
      store.dispatch(fetchNotifications.pending('', { page: 1, limit: 20 }));
      const state = store.getState().notifications;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state with first page', () => {
      const payload = {
        notifications: [
          {
            id: '1',
            userId: 'user-1',
            title: 'Test',
            message: 'Test',
            type: 'system' as const,
            read: false,
            createdAt: '2025-10-06T00:00:00Z',
            updatedAt: '2025-10-06T00:00:00Z',
          },
        ],
        total: 10,
        page: 1,
        limit: 20,
        unreadCount: 5,
      };

      store.dispatch(fetchNotifications.fulfilled(payload, '', { page: 1, limit: 20 }));
      const state = store.getState().notifications;
      
      expect(state.loading).toBe(false);
      expect(state.notifications).toHaveLength(1);
      expect(state.total).toBe(10);
      expect(state.unreadCount).toBe(5);
      expect(state.hasMore).toBe(true);
    });

    it('should handle rejected state', () => {
      const error = new Error('Failed to fetch');
      store.dispatch(fetchNotifications.rejected(error, '', { page: 1, limit: 20 }));
      const state = store.getState().notifications;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('markNotificationAsRead', () => {
    beforeEach(() => {
      // Add an unread notification first
      store.dispatch(addNotification({
        id: '1',
        userId: 'user-1',
        title: 'Test',
        message: 'Test',
        type: 'system',
        read: false,
        createdAt: '2025-10-06T00:00:00Z',
        updatedAt: '2025-10-06T00:00:00Z',
      }));
    });

    it('should mark notification as read and update unread count', () => {
      const updatedNotification = {
        id: '1',
        userId: 'user-1',
        title: 'Test',
        message: 'Test',
        type: 'system' as const,
        read: true,
        createdAt: '2025-10-06T00:00:00Z',
        updatedAt: '2025-10-06T00:00:00Z',
      };

      store.dispatch(markNotificationAsRead.fulfilled(updatedNotification, '', '1'));
      const state = store.getState().notifications;
      
      expect(state.notifications[0].read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    beforeEach(() => {
      // Add multiple unread notifications
      store.dispatch(addNotification({
        id: '1',
        userId: 'user-1',
        title: 'Test 1',
        message: 'Test',
        type: 'system',
        read: false,
        createdAt: '2025-10-06T00:00:00Z',
        updatedAt: '2025-10-06T00:00:00Z',
      }));
      store.dispatch(addNotification({
        id: '2',
        userId: 'user-1',
        title: 'Test 2',
        message: 'Test',
        type: 'system',
        read: false,
        createdAt: '2025-10-06T00:00:00Z',
        updatedAt: '2025-10-06T00:00:00Z',
      }));
    });

    it('should mark all notifications as read', () => {
      store.dispatch(markAllNotificationsAsRead.fulfilled({ success: true, count: 2 }, '', undefined));
      const state = store.getState().notifications;
      
      expect(state.notifications.every(n => n.read)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    beforeEach(() => {
      store.dispatch(addNotification({
        id: '1',
        userId: 'user-1',
        title: 'Test',
        message: 'Test',
        type: 'system',
        read: false,
        createdAt: '2025-10-06T00:00:00Z',
        updatedAt: '2025-10-06T00:00:00Z',
      }));
    });

    it('should delete notification and update counts', () => {
      store.dispatch(deleteNotification.fulfilled('1', '', '1'));
      const state = store.getState().notifications;
      
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
      expect(state.total).toBe(0);
    });
  });
});
