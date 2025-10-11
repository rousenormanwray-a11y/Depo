import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PageTransition,
  CountUpAnimation,
  PulseRing,
} from '../../components/animations';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import { adminService } from '../../services';

interface Transaction {
  id: string;
  userId: string;
  type: 'donation' | 'withdrawal' | 'redemption' | 'coin_purchase';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  createdAt: string;
  flagReason?: string;
}

const TransactionMonitoringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const filter = route.params?.filter;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>(filter || 'all');

  useEffect(() => {
    loadTransactions();
  }, [selectedFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTransactionMonitoring({
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
      });
      setTransactions(response.transactions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleFlagTransaction = (transaction: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.prompt(
      'Flag Transaction',
      'Enter reason for flagging:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          onPress: async (reason) => {
            if (!reason) return;
            try {
              await adminService.flagTransaction(transaction.id, reason);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Alert.alert('Success', 'Transaction flagged for review');
              loadTransactions();
            } catch (error) {
              Alert.alert('Error', 'Failed to flag transaction');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: colors.success, icon: 'check-circle', label: 'Completed' };
      case 'pending':
        return { color: colors.warning, icon: 'pending', label: 'Pending' };
      case 'failed':
        return { color: colors.error, icon: 'error', label: 'Failed' };
      case 'flagged':
        return { color: colors.error, icon: 'flag', label: 'Flagged' };
      default:
        return { color: colors.gray[500], icon: 'help', label: status };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderTransaction = ({ item: transaction }: { item: Transaction }) => {
    const statusConfig = getStatusConfig(transaction.status);
    const isFlagged = transaction.status === 'flagged';

    return (
      <TouchableOpacity
        style={[styles.transactionCard, isFlagged && styles.flaggedCard]}
        onPress={() => handleTransactionPress(transaction)}
      >
        {isFlagged ? (
          <PulseRing size={50} color={colors.error}>
            <View style={[styles.transactionIcon, { backgroundColor: `${colors.error}20` }]}>
              <Icon name="flag" size={24} color={colors.error} />
            </View>
          </PulseRing>
        ) : (
          <View style={[styles.transactionIcon, { backgroundColor: `${statusConfig.color}20` }]}>
            <Icon name={statusConfig.icon} size={24} color={statusConfig.color} />
          </View>
        )}

        <View style={styles.transactionInfo}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>{transaction.type.replace('_', ' ')}</Text>
            <EnhancedBadge
              value={statusConfig.label}
              color={statusConfig.color}
              size="small"
            />
          </View>
          <CountUpAnimation
            value={transaction.amount}
            style={styles.transactionAmount}
            prefix="₦"
            decimals={0}
          />
          <Text style={styles.transactionDate}>
            {new Date(transaction.createdAt).toLocaleString()}
          </Text>
          {transaction.flagReason && (
            <Text style={styles.flagReason}>⚠️ {transaction.flagReason}</Text>
          )}
        </View>

        {transaction.status !== 'flagged' && (
          <TouchableOpacity
            style={styles.flagButton}
            onPress={(e) => {
              e.stopPropagation();
              handleFlagTransaction(transaction);
            }}
          >
            <Icon name="flag" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Transaction Monitoring</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'failed', label: 'Failed' },
            { key: 'flagged', label: 'Flagged' },
            { key: 'completed', label: 'Completed' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                selectedFilter === filterOption.key && styles.activeFilter,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filterOption.key);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filterOption.key && styles.activeFilterText,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      </SafeAreaView>
    </PageTransition>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: layout.screenPadding,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  flaggedCard: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  transactionType: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  flagReason: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  flagButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default TransactionMonitoringScreen;
