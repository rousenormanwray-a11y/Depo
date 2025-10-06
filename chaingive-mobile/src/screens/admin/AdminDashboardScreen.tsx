import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import GradientCard from '../../components/common/GradientCard';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import { AnimatedNumber } from '../../components/animated';
import { CardSkeleton, ListSkeleton } from '../../components/skeletons';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (spacing.md * 3)) / 2;

interface MetricCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface QuickStat {
  label: string;
  value: number;
  icon: string;
  urgent?: boolean;
  action: () => void;
}

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'large_transaction' | 'agent_verified' | 'dispute_filed' | 'kyc_pending';
  message: string;
  time: string;
  icon: string;
  urgent?: boolean;
}

const AdminDashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      setMetrics([
        {
          label: 'Total Users',
          value: 15234,
          icon: 'people',
          color: colors.primary,
          change: '+12.5%',
          trend: 'up',
        },
        {
          label: 'Total Volume',
          value: 8450000,
          icon: 'account-balance-wallet',
          color: colors.success,
          change: '+8.3%',
          trend: 'up',
        },
        {
          label: 'Active Cycles',
          value: 342,
          icon: 'refresh',
          color: colors.info,
          change: '+15',
          trend: 'up',
        },
        {
          label: 'Success Rate',
          value: 96.5,
          icon: 'trending-up',
          color: colors.gold,
          change: '+2.1%',
          trend: 'up',
        },
      ]);

      setQuickStats([
        { label: 'Pending KYC', value: 23, icon: 'badge', urgent: true, action: () => {} },
        { label: 'Open Disputes', value: 7, icon: 'gavel', urgent: true, action: () => {} },
        { label: 'Failed Txns', value: 12, icon: 'error', urgent: true, action: () => {} },
        { label: 'Active Agents', value: 156, icon: 'work', action: () => {} },
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'user_registered',
          message: 'New user registered: John Doe',
          time: '2 min ago',
          icon: 'person-add',
        },
        {
          id: '2',
          type: 'large_transaction',
          message: 'Large transaction: ₦500,000',
          time: '5 min ago',
          icon: 'warning',
          urgent: true,
        },
        {
          id: '3',
          type: 'agent_verified',
          message: 'Agent verified: Sarah Agent',
          time: '10 min ago',
          icon: 'verified',
        },
        {
          id: '4',
          type: 'dispute_filed',
          message: 'New dispute filed by User #4523',
          time: '15 min ago',
          icon: 'gavel',
          urgent: true,
        },
        {
          id: '5',
          type: 'kyc_pending',
          message: '5 new KYC submissions',
          time: '30 min ago',
          icon: 'badge',
        },
      ]);

      setLoading(false);
    }, 1500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Platform Overview</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Icon name="notifications" size={24} color={colors.text.primary} />
          <EnhancedBadge value={5} pulse position="top-right" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          {loading ? (
            <View style={styles.metricsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={120} />
              ))}
            </View>
          ) : (
            <View style={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.metricCard, { width: cardWidth }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                    <Icon name={metric.icon} size={28} color={metric.color} />
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <AnimatedNumber
                    value={metric.label === 'Total Volume' ? metric.value : metric.value}
                    duration={1000}
                    formatter={(val) => 
                      metric.label === 'Total Volume'
                        ? formatCurrency(val)
                        : metric.label === 'Success Rate'
                        ? `${val.toFixed(1)}%`
                        : formatNumber(val)
                    }
                    style={styles.metricValue}
                  />
                  <View style={styles.metricChange}>
                    <Icon
                      name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={metric.trend === 'up' ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: metric.trend === 'up' ? colors.success : colors.error },
                      ]}
                    >
                      {metric.change}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          {loading ? (
            <View style={styles.quickStatsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={80} />
              ))}
            </View>
          ) : (
            <View style={styles.quickStatsGrid}>
              {quickStats.map((stat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickStatCard,
                    { width: cardWidth },
                    stat.urgent && styles.urgentCard,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    stat.action();
                  }}
                >
                  <View style={styles.quickStatHeader}>
                    <Icon
                      name={stat.icon}
                      size={24}
                      color={stat.urgent ? colors.error : colors.text.secondary}
                    />
                    {stat.urgent && (
                      <EnhancedBadge
                        value="!"
                        color={colors.error}
                        size="small"
                        pulse
                      />
                    )}
                  </View>
                  <AnimatedNumber
                    value={stat.value}
                    duration={800}
                    style={[
                      styles.quickStatValue,
                      stat.urgent && { color: colors.error },
                    ]}
                  />
                  <Text style={styles.quickStatLabel}>{stat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ListSkeleton count={5}>
              <CardSkeleton height={70} />
            </ListSkeleton>
          ) : (
            <View>
              {recentActivity.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[styles.activityItem, activity.urgent && styles.urgentActivity]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.urgent ? `${colors.error}20` : `${colors.primary}20` },
                    ]}
                  >
                    <Icon
                      name={activity.icon}
                      size={20}
                      color={activity.urgent ? colors.error : colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityMessage}>{activity.message}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  {activity.urgent && (
                    <EnhancedBadge
                      value="Urgent"
                      color={colors.error}
                      size="small"
                      variant="solid"
                      position="inline"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { icon: 'people', label: 'Manage Users', color: colors.primary },
              { icon: 'money', label: 'Transactions', color: colors.success },
              { icon: 'gavel', label: 'Disputes', color: colors.error },
              { icon: 'settings', label: 'Settings', color: colors.gray[600] },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { width: cardWidth }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={32} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.bodySmallBold,
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  metricIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  metricValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickStatCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  urgentCard: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  quickStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickStatValue: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  urgentActivity: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    ...typography.bodySmallBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
