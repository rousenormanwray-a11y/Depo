import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { walletService, Transaction } from '../../services/walletService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

type FilterType = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'DONATION_SENT' | 'DONATION_RECEIVED' | 'REDEMPTION';

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await walletService.getTransactions(page, 50);
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPage(1);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleShareTransaction = (transaction: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Share Transaction', `Share transaction ${transaction.id}?`);
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Download Receipt', `Download receipt for ${transaction.id}?`);
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
    return date.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return {
          icon: 'add-circle',
          color: colors.success,
          label: 'Deposit',
        };
      case 'WITHDRAWAL':
        return {
          icon: 'remove-circle',
          color: colors.warning,
          label: 'Withdrawal',
        };
      case 'DONATION_SENT':
        return {
          icon: 'favorite',
          color: colors.primary,
          label: 'Donation Sent',
        };
      case 'DONATION_RECEIVED':
        return {
          icon: 'card-giftcard',
          color: colors.success,
          label: 'Donation Received',
        };
      case 'REDEMPTION':
        return {
          icon: 'redeem',
          color: colors.tertiary,
          label: 'Redemption',
        };
      default:
        return {
          icon: 'sync',
          color: colors.gray[500],
          label: type,
        };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'FAILED':
      case 'CANCELLED':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const filteredTransactions = filter === 'ALL'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const typeConfig = getTypeConfig(item.type);
    const statusColor = getStatusColor(item.status);
    const isPositive = item.type === 'DEPOSIT' || item.type === 'DONATION_RECEIVED';

    const leftAction: SwipeAction = {
      icon: 'receipt',
      label: 'Receipt',
      color: colors.info,
      onPress: () => handleDownloadReceipt(item),
    };

    const rightAction: SwipeAction = {
      icon: 'share',
      label: 'Share',
      color: colors.success,
      onPress: () => handleShareTransaction(item),
    };

    return (
      <SwipeableRow
        leftAction={leftAction}
        rightAction={rightAction}
      >
        <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('TransactionDetail', { transactionId: item.id });
          }}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.color}20` }]}>
            <Icon name={typeConfig.icon} size={24} color={typeConfig.color} />
          </View>

          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{typeConfig.label}</Text>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
            <EnhancedBadge
              value={item.status}
              color={statusColor}
              textColor={colors.white}
              size="small"
              variant="solid"
              position="inline"
              style={styles.statusBadge}
            />
          </View>
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  const renderEmptyState = () => (
    <EnhancedEmptyState
      icon="receipt-long"
      title="No Transactions Yet"
      description="Your transaction history will appear here once you start making donations, deposits, or withdrawals."
      actionLabel="Make Your First Donation"
      onActionPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.navigate('GiveScreen');
      }}
      style={styles.emptyState}
    />
  );

  return (
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'DONATION_SENT', 'DONATION_RECEIVED', 'REDEMPTION'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f);
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <ListSkeleton count={8}>
          <CardSkeleton height={90} />
        </ListSkeleton>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            filteredTransactions.length === 0 && styles.emptyListContent,
          ]}
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
      )}
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
  filterScroll: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterContent: {
    padding: layout.screenPadding,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: layout.screenPadding,
    paddingBottom: 100, // Account for floating tab bar
  },
  emptyListContent: {
    flex: 1,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  transactionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.bodyRegular,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
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
});

export default TransactionHistoryScreen;
