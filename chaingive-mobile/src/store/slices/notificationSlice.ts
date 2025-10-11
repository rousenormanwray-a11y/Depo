import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import notificationService, { Notification, NotificationResponse } from '../../services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  total: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  total: 0,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) => {
    const response = await notificationService.getNotifications(page, limit);
    return response;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const count = await notificationService.getUnreadCount();
    return count;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    const notification = await notificationService.markAsRead(notificationId);
    return notification;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const result = await notificationService.markAllAsRead();
    return result;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    return notificationId;
  }
);

export const registerPushToken = createAsyncThunk(
  'notifications/registerPushToken',
  async ({ 
    pushToken, 
    deviceInfo 
  }: { 
    pushToken: string; 
    deviceInfo?: { platform?: string; model?: string; osVersion?: string } 
  }) => {
    const result = await notificationService.registerPushToken(pushToken, deviceInfo);
    return result;
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.page = 1;
      state.hasMore = true;
      state.total = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification at the beginning (most recent first)
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      state.total += 1;
    },
    updateNotificationLocally: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationResponse>) => {
        state.loading = false;
        
        if (action.payload.page === 1) {
          // First page - replace all
          state.notifications = action.payload.notifications;
        } else {
          // Subsequent pages - append
          state.notifications = [...state.notifications, ...action.payload.notifications];
        }
        
        state.page = action.payload.page;
        state.total = action.payload.total;
        state.unreadCount = action.payload.unreadCount;
        state.hasMore = state.notifications.length < action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (action.payload.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
        const deletedNotification = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        
        if (deletedNotification && !deletedNotification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { 
  clearNotifications, 
  clearError, 
  addNotification,
  updateNotificationLocally,
} = notificationSlice.actions;

export default notificationSlice.reducer;
