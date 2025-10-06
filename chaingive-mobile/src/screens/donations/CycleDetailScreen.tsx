import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { cycleService, Cycle } from '../../services/cycleService';
import { donationService } from '../../services/donationService';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const CycleDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cycleId } = route.params as { cycleId: string };

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchCycleDetails();
  }, []);

  const fetchCycleDetails = async () => {
    try {
      setLoading(true);
      const response = await cycleService.getCycleById(cycleId);
      setCycle(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cycle details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!cycle?.donation) return;

    Alert.alert(
      'Confirm Receipt',
      `Have you received the donation of ${formatCurrency(cycle.amount)}?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Confirm',
          onPress: async () => {
            setConfirming(true);
            try {
              const response = await donationService.confirmReceipt(cycle.donation!.id);
              
              Alert.alert(
                'Confirmed!',
                `You've earned ${response.charityCoinsEarned} Charity Coins!`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      fetchCycleDetails();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to confirm receipt');
            } finally {
              setConfirming(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: colors.warning,
          icon: 'pending',
          label: 'Pending',
        };
      case 'FULFILLED':
        return {
          color: colors.success,
          icon: 'check-circle',
          label: 'Fulfilled',
        };
      case 'DEFAULTED':
        return {
          color: colors.error,
          icon: 'cancel',
          label: 'Defaulted',
        };
      default:
        return {
          color: colors.gray[500],
          icon: 'help',
          label: status,
        };
    }
  };

  if (loading || !cycle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(cycle.status);
  const daysUntilDue = getDaysUntilDue(cycle.dueDate);
  const canConfirm = cycle.type === 'RECEIVE' && cycle.status === 'PENDING';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cycle Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Icon name={statusConfig.icon} size={24} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            {cycle.type === 'GIVE' ? 'You Gave' : 'You Received'}
          </Text>
          <Text style={styles.amountValue}>{formatCurrency(cycle.amount)}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Timeline</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Cycle Created</Text>
              <Text style={styles.timelineDate}>{formatDate(cycle.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[
              styles.timelineDot,
              { backgroundColor: cycle.status === 'FULFILLED' ? colors.success : colors.gray[300] }
            ]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Due Date</Text>
              <Text style={styles.timelineDate}>{formatDate(cycle.dueDate)}</Text>
              {cycle.status === 'PENDING' && (
                <Text style={styles.timelineDays}>
                  {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : 'Overdue'}
                </Text>
              )}
            </View>
          </View>

          {cycle.completedAt && (
            <>
              <View style={styles.timelineLine} />
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Completed</Text>
                  <Text style={styles.timelineDate}>{formatDate(cycle.completedAt)}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Donation Details */}
        {cycle.donation && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>
              {cycle.type === 'GIVE' ? 'Recipient' : 'Donor'} Details
            </Text>
            
            {cycle.type === 'GIVE' && cycle.donation.recipient && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>
                    {cycle.donation.recipient.firstName} {cycle.donation.recipient.lastName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trust Score:</Text>
                  <Text style={styles.detailValue}>
                    {cycle.donation.recipient.trustScore}/100
                  </Text>
                </View>
              </View>
            )}

            {cycle.type === 'RECEIVE' && cycle.donation.donor && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>
                    {cycle.donation.donor.firstName} {cycle.donation.donor.lastName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trust Score:</Text>
                  <Text style={styles.detailValue}>
                    {cycle.donation.donor.trustScore}/100
                  </Text>
                </View>
              </View>
            )}

            {cycle.donation.confirmedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confirmed:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(cycle.donation.confirmedAt)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Escrow Info */}
        {cycle.status === 'PENDING' && cycle.type === 'RECEIVE' && (
          <View style={styles.infoCard}>
            <Icon name="info" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Funds are held in escrow for 48 hours. Confirm receipt to release funds to the donor.
            </Text>
          </View>
        )}

        {/* Confirm Button */}
        {canConfirm && (
          <Button
            title="Confirm Receipt"
            onPress={handleConfirmReceipt}
            loading={confirming}
            icon="check-circle"
            fullWidth
            style={styles.confirmButton}
          />
        )}
      </ScrollView>
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
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: layout.screenPadding,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.h4,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountLabel: {
    ...typography.bodyRegular,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  amountValue: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.gray[200],
    marginLeft: 5,
    marginVertical: spacing.xs,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timelineDays: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.info}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    marginLeft: spacing.sm,
    flex: 1,
  },
  confirmButton: {
    marginBottom: spacing.lg,
  },
});

export default CycleDetailScreen;
