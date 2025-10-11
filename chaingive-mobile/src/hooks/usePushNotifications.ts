import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { AppDispatch } from '../store/store';
import {
  addNotification,
  fetchUnreadCount,
} from '../store/slices/notificationSlice';
import pushNotificationService from '../services/pushNotificationService';

/**
 * Custom hook for managing push notifications
 * Handles initialization, listeners, and navigation
 */
export const usePushNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize push notifications
    const initializeNotifications = async () => {
      try {
        const success = await pushNotificationService.initialize();
        if (success) {
          console.log('Push notifications initialized successfully');
        } else {
          console.warn('Failed to initialize push notifications');
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializeNotifications();

    // Listener for notifications received while app is in foreground
    notificationListener.current =
      pushNotificationService.addNotificationReceivedListener((notification) => {
        console.log('Notification received in foreground:', notification);

        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Add to Redux store
        const notificationData = notification.request.content;
        dispatch(
          addNotification({
            id: notification.request.identifier,
            userId: '', // Will be set by backend
            title: notificationData.title || 'New Notification',
            message: notificationData.body || '',
            type: (notificationData.data?.type as any) || 'system',
            read: false,
            data: notificationData.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );

        // Update unread count
        dispatch(fetchUnreadCount());
      });

    // Listener for when user taps on notification
    responseListener.current =
      pushNotificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Notification response:', response);

          // Haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          // Handle deep linking based on notification data
          handleNotificationNavigation(response.notification.request.content.data);
        }
      );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [dispatch]);

  /**
   * Handle navigation when user taps on notification
   */
  const handleNotificationNavigation = (data: Record<string, any>) => {
    if (!data || !data.type) {
      // Default to notifications screen
      navigation.navigate('Notifications');
      return;
    }

    switch (data.type) {
      case 'donation':
        if (data.cycleId) {
          navigation.navigate('CycleDetail', { cycleId: data.cycleId });
        } else {
          navigation.navigate('GiveScreen');
        }
        break;

      case 'achievement':
        if (data.achievementId) {
          navigation.navigate('Achievements', { achievementId: data.achievementId });
        } else {
          navigation.navigate('Profile');
        }
        break;

      case 'marketplace':
        if (data.itemId) {
          navigation.navigate('ItemDetail', { itemId: data.itemId });
        } else {
          navigation.navigate('Marketplace');
        }
        break;

      case 'agent':
        if (data.requestId) {
          navigation.navigate('VerificationDetail', { requestId: data.requestId });
        } else {
          navigation.navigate('AgentDashboard');
        }
        break;

      case 'cycle':
        if (data.cycleId) {
          navigation.navigate('CycleDetail', { cycleId: data.cycleId });
        }
        break;

      case 'wallet':
        navigation.navigate('TransactionHistory');
        break;

      default:
        navigation.navigate('Notifications');
    }
  };

  return {
    handleNotificationNavigation,
  };
};

export default usePushNotifications;
