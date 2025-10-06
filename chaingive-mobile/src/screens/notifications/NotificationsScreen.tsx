import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PulseRing,
  PageTransition,
  SwipeableRow,
} from '../../components/animations';
import EnhancedBadge from '../../components/common/EnhancedBadge';

const { width: screenWidth } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'DONATION' | 'CYCLE' | 'MARKETPLACE' | 'AGENT' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

// Mock notifications - replace with API call
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'DONATION',
    title: 'Donation Received!',
    message: 'You received ₦5,000 from John Doe',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'CYCLE',
    title: 'Cycle Due Soon',
    message: 'Your donation cycle is due in 3 days',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'MARKETPLACE',
    title: 'Redemption Successful',
    message: 'Your airtime of ₦500 has been delivered',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'AGENT',
    title: 'Agent Request',
    message: 'Jane wants to buy ₦10,000 in coins',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const handleMarkAsRead = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Fetch notifications from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate based on notification type
    switch (notification.type) {
      case 'DONATION':
      case 'CYCLE':
        navigation.navigate('CycleDetail', { cycleId: notification.data?.cycleId });
        break;
      case 'MARKETPLACE':
        navigation.navigate('RedemptionHistory');
        break;
      case 'AGENT':
        navigation.navigate('ConfirmCoinPayment');
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'DONATION':
        return {
          icon: 'favorite',
          color: colors.primary,
        };
      case 'CYCLE':
        return {
          icon: 'sync',
          color: colors.warning,
        };
      case 'MARKETPLACE':
        return {
          icon: 'redeem',
          color: colors.tertiary,
        };
      case 'AGENT':
        return {
          icon: 'person',
          color: colors.secondary,
        };
      case 'SYSTEM':
        return {
          icon: 'info',
          color: colors.info,
        };
      default:
        return {
          icon: 'notifications',
          color: colors.gray[500],
        };
    }
  };

  const filteredNotifications = filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const typeConfig = getTypeConfig(item.type);
    const isUrgent = !item.read && ['AGENT', 'CYCLE'].includes(item.type);

    return (
      <SwipeableRow
        leftAction={{
          icon: 'check',
          label: 'Read',
          color: colors.success,
          onPress: () => handleMarkAsRead(item.id),
        }}
        rightAction={{
          icon: 'delete',
          label: 'Delete',
          color: colors.error,
          onPress: () => handleDeleteNotification(item.id),
        }}
      >
        <TouchableOpacity
          style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleNotificationPress(item);
          }}
        >
          <View style={styles.iconWrapper}>
            {isUrgent && (
              <View style={styles.pulseWrapper}>
                <PulseRing size={50} color={typeConfig.color} count={2} duration={2000} />
              </View>
            )}
            <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.color}20` }]}>
              <Icon name={typeConfig.icon} size={24} color={typeConfig.color} />
            </View>
          </View>

          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              {!item.read && (
                <EnhancedBadge
                  value="New"
                  color={colors.primary}
                  size="small"
                  variant="solid"
                  position="inline"
                  pulse
                />
              )}
            </View>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-none" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No Notifications</Text>
      <Text style={styles.emptyStateSubtitle}>
        {filter === 'UNREAD'
          ? 'You have no unread notifications'
          : 'Your notifications will appear here'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageTransition type="fade" duration={300}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitleText}>Notifications</Text>
            {unreadCount > 0 && (
              <EnhancedBadge
                value={unreadCount}
                color={colors.error}
                size="small"
                pulse
                position="inline"
                style={styles.headerBadge}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleMarkAllRead();
            }}
          >
            <Icon name="done-all" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'ALL' && styles.filterButtonActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterButtonText, filter === 'ALL' && styles.filterButtonTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'UNREAD' && styles.filterButtonActive]}
          onPress={() => setFilter('UNREAD')}
        >
          <Text style={[styles.filterButtonText, filter === 'UNREAD' && styles.filterButtonTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Clear All */}
      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearAll}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
      </PageTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerBadge: {
    marginLeft: spacing.xs,
  },
  iconWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  pulseWrapper: {
    position: 'absolute',
    top: -5,
    left: -5,
  },
  headerAction: {
    padding: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: layout.screenPadding,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: layout.screenPadding,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  notificationMessage: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  clearButton: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  clearButtonText: {
    ...typography.bodyRegular,
    color: colors.error,
  },
});

export default NotificationsScreen;
