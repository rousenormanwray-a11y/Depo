import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchAgentData,
  processVerificationRequest,
  updateAgentStatus,
  clearError,
} from '../../store/slices/agentSlice';
import { VerificationRequest } from '../../types';
import StatsCard from '../../components/agent/StatsCard';
import VerificationRequestCard from '../../components/agent/VerificationRequestCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import {
  CountUpAnimation,
  ConfettiCelebration,
  PageTransition,
  PulseRing,
  LottieSuccess,
  FloatingHearts,
} from '../../components/animations';
import EnhancedBadge from '../../components/common/EnhancedBadge';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (spacing.md * 3)) / 2;

const AgentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { agent, pendingRequests, loading, error } = useSelector(
    (state: RootState) => state.agent
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchAgentData(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    if (user) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRefreshing(true);
      await dispatch(fetchAgentData(user.id));
      setRefreshing(false);
    }
  };

  const handleToggleStatus = () => {
    if (agent) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newStatus = !agent.isActive;
      Alert.alert(
        'Change Status',
        `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} your agent status?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              dispatch(updateAgentStatus(newStatus));
              if (newStatus) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            },
          },
        ]
      );
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    Alert.alert(
      'Approve Verification',
      'Are you sure you want to approve this verification request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await dispatch(
                processVerificationRequest({
                  requestId,
                  status: 'approved',
                  notes: 'Approved by agent',
                })
              ).unwrap();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowSuccess(true);
              setShowCelebration(true);
              setTimeout(() => setShowSuccess(false), 2000);
              setTimeout(() => setShowCelebration(false), 3000);
              Alert.alert('Success', 'Verification request approved');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve request');
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.prompt(
      'Reject Verification',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (notes) => {
            try {
              await dispatch(
                processVerificationRequest({
                  requestId,
                  status: 'rejected',
                  notes: notes || 'Rejected by agent',
                })
              ).unwrap();
              Alert.alert('Success', 'Verification request rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject request');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleRequestPress = (request: VerificationRequest) => {
    navigation.navigate('VerificationDetail', { requestId: request.id });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="work" size={64} color={colors.gray[300]} />
          <Text style={styles.loadingText}>Loading agent dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageTransition type="slideUp">
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
          <View style={styles.titleContainer}>
            <Icon name="work" size={28} color={colors.primary} />
            <View style={styles.titleText}>
              <Text style={styles.title}>Agent Dashboard</Text>
              <Text style={styles.agentCode}>Code: {agent.agentCode}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              agent.isActive ? styles.activeStatus : styles.inactiveStatus,
            ]}
            onPress={handleToggleStatus}
          >
            <Icon
              name={agent.isActive ? 'check-circle' : 'pause-circle-filled'}
              size={16}
              color={colors.white}
            />
            <Text style={styles.statusButtonText}>
              {agent.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color={colors.text.secondary} />
          <Text style={styles.locationText}>
            {agent.location.city}, {agent.location.state}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, { width: cardWidth }]}>
            <StatsCard
              title="Total Verifications"
              value={agent.totalVerifications}
              icon="verified-user"
              color={colors.primary}
              trend={{ value: 12, isPositive: true }}
            />
          </View>
          <View style={[styles.statsCard, { width: cardWidth }]}>
            <StatsCard
              title="Cash Deposits"
              value={agent.totalDeposits}
              icon="account-balance-wallet"
              color={colors.secondary}
              trend={{ value: 8, isPositive: true }}
            />
          </View>
          <View style={[styles.statsCard, { width: cardWidth }]}>
            <StatsCard
              title="Commission Earned"
              value={formatCurrency(agent.commissionEarned)}
              icon="monetization-on"
              color={colors.success}
              trend={{ value: 15, isPositive: true }}
            />
          </View>
          <View style={[styles.statsCard, { width: cardWidth }]}>
            <StatsCard
              title="Agent Rating"
              value={`${agent.rating}/5.0`}
              icon="star"
              color={colors.tertiary}
              subtitle={`Based on ${agent.totalVerifications} reviews`}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('VerifyUser')}
            >
              <Icon name="person-add" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Verify User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CashDeposit')}
            >
              <Icon name="attach-money" size={24} color={colors.success} />
              <Text style={styles.actionButtonText}>Cash Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Verification Requests */}
        <View style={styles.pendingRequests}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pending Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="check-circle" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyStateText}>
                No pending verification requests
              </Text>
            </View>
          ) : (
            pendingRequests.slice(0, 3).map((request) => (
              <VerificationRequestCard
                key={request.id}
                request={request}
                onPress={handleRequestPress}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            ))
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  agentCode: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  activeStatus: {
    backgroundColor: colors.success,
  },
  inactiveStatus: {
    backgroundColor: colors.gray[500],
  },
  statusButtonText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.sm,
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
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: cardWidth,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    ...typography.label,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pendingRequests: {
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyStateText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default AgentDashboardScreen;