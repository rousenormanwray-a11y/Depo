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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchUserBalance } from '../../store/slices/authSlice';
import { fetchDashboard } from '../../store/slices/gamificationSlice';
import StreakWidget from '../../components/gamification/ProgressRings';
import ProgressRings from '../../components/gamification/ProgressRings';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { BalanceCardSkeleton, CardSkeleton, ListSkeleton } from '../../components/skeletons';
import { AnimatedNumber, FadeInView } from '../../components/animated';
import {
  PageTransition,
  PullToRefreshAnimation,
  CountUpAnimation,
  MorphingFAB,
  StreakFlame,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (spacing.md * 3)) / 2;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { streak, todaysProgress } = useSelector((state: RootState) => state.gamification);

  const [refreshing, setRefreshing] = useState(false);
  const [showFAB, setShowFAB] = useState(true);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBalance(user.id));
      dispatch(fetchDashboard());
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Promise.all([
        dispatch(fetchUserBalance(user.id)),
        dispatch(fetchDashboard()),
      ]);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const quickActions = [
    {
      title: 'Give',
      icon: 'favorite',
      color: colors.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('GiveScreen');
      },
    },
    {
      title: 'Deposit',
      icon: 'add-circle',
      color: colors.success,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('DepositScreen');
      },
    },
    {
      title: 'Withdraw',
      icon: 'remove-circle',
      color: colors.warning,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('WithdrawScreen');
      },
    },
    {
      title: 'History',
      icon: 'history',
      color: colors.info,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('TransactionHistory');
      },
    },
  ];

  const fabActions = [
    {
      icon: 'favorite',
      label: 'Give',
      color: colors.primary,
      onPress: () => navigation.navigate('GiveScreen'),
    },
    {
      icon: 'shopping-cart',
      label: 'Marketplace',
      color: colors.secondary,
      onPress: () => navigation.navigate('MarketplaceScreen'),
    },
    {
      icon: 'add-circle',
      label: 'Buy Coins',
      color: colors.success,
      onPress: () => navigation.navigate('BuyCoinsScreen'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak Widget */}
        {streak && (
          <FadeInView duration={300}>
            <StreakWidget
              currentStreak={streak.currentStreak || 0}
              longestStreak={streak.longestStreak || 0}
              lastActiveDate={streak.lastActiveDate}
            />
          </FadeInView>
        )}

        {/* Balance Card */}
        {loading && !user ? (
          <BalanceCardSkeleton />
        ) : (
          <FadeInView duration={400}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <TouchableOpacity
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Icon name="visibility" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
              <AnimatedNumber
                value={user?.balance || 0}
                duration={1000}
                formatter={formatCurrency}
                style={styles.balanceAmount}
              />
              <View style={styles.coinsContainer}>
                <Icon name="stars" size={16} color={colors.white} />
                <AnimatedNumber
                  value={user?.charityCoins || 0}
                  duration={800}
                  formatter={(val) => `${Math.round(val)} Charity Coins`}
                  style={styles.coinsText}
                />
              </View>
            </View>
          </FadeInView>
        )}

        {/* Progress Rings - Daily Goals */}
        {todaysProgress && (
          <FadeInView duration={500} delay={200}>
            <ProgressRings
              giveProgress={todaysProgress.giveProgress || 0}
              giveGoal={todaysProgress.giveGoal || 1}
              earnProgress={todaysProgress.earnProgress || 0}
              earnGoal={todaysProgress.earnGoal || 50}
              engageProgress={todaysProgress.engageProgress || 0}
              engageGoal={todaysProgress.engageGoal || 3}
            />
          </FadeInView>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { width: cardWidth }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  action.onPress();
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {/* Mock activity items */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${colors.success}20` }]}>
                <Icon name="add" size={20} color={colors.success} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Deposit</Text>
                <Text style={styles.activityDate}>Today, 2:30 PM</Text>
              </View>
              <Text style={styles.activityAmount}>+₦5,000</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Icon name="favorite" size={20} color={colors.primary} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Donation to Orphanage</Text>
                <Text style={styles.activityDate}>Yesterday, 4:15 PM</Text>
              </View>
              <Text style={[styles.activityAmount, { color: colors.primary }]}>-₦2,000</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${colors.tertiary}20` }]}>
                <Icon name="redeem" size={20} color={colors.tertiary} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Redeemed Airtime</Text>
                <Text style={styles.activityDate}>2 days ago</Text>
              </View>
              <Text style={[styles.activityAmount, { color: colors.tertiary }]}>-50 CC</Text>
            </View>
          </View>
        </View>

        {/* Impact Summary */}
        <View style={styles.impactSummary}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>12</Text>
              <Text style={styles.impactLabel}>Donations Made</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>₦25,000</Text>
              <Text style={styles.impactLabel}>Total Given</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>8</Text>
              <Text style={styles.impactLabel}>Lives Touched</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Morphing FAB for quick actions */}
      {showFAB && (
        <MorphingFAB
          mainIcon="add"
          mainColor={colors.primary}
          actions={fabActions}
          position="bottom-right"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.bodyRegular,
    color: colors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: spacing.xs,
    opacity: 0.9,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.label,
    color: colors.text.primary,
    textAlign: 'center',
  },
  recentActivity: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.label,
    color: colors.primary,
  },
  activityList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityAmount: {
    ...typography.label,
    color: colors.success,
    fontWeight: '600',
  },
  impactSummary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  impactLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;