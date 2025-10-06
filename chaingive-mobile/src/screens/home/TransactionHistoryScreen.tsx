import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import Skeleton from '../../components/common/Skeleton';
import { fetchTransactions } from '../../store/slices/walletSlice';

const iconFor = (type: string) => {
  switch (type) {
    case 'deposit': return { name: 'add', color: colors.success };
    case 'donation_sent': return { name: 'favorite', color: colors.primary };
    case 'redemption': return { name: 'redeem', color: colors.tertiary };
    default: return { name: 'receipt-long', color: colors.text.primary };
  }
};

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, isLoadingTransactions, page, hasMore } = useSelector((s: RootState) => s.wallet);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, limit: 50 }));
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoadingTransactions ? (
        <View style={styles.list}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: `${colors.gray[200]}20` }]} />
              <View style={[styles.itemDetails, { flex: 1 }]}> 
                <Skeleton height={16} />
                <Skeleton height={12} style={{ marginTop: spacing.xs, width: '40%' }} />
              </View>
              <Skeleton height={16} width={80} />
            </View>
          ))}
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="receipt-long" size={48} color={colors.gray[300]} />
          <Text style={styles.empty}>No transactions yet.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions as any}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const icon = iconFor(item.type);
          return (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}>
                <View style={[styles.itemIcon, { backgroundColor: `${icon.color}20` }]}>
                  <Icon name={icon.name} size={20} color={icon.color} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{String(item.type).replace('_', ' ')}</Text>
                  <Text style={styles.itemDate}>{item.createdAt || ''}</Text>
                </View>
                <Text style={[styles.itemAmount, item.type === 'deposit' ? styles.plus : styles.minus]}>
                  {item.type === 'redemption' ? `- ${item.amount} CC` : `${item.type === 'deposit' ? '+' : '-'}₦${Number(item.amount).toLocaleString()}`}
                </Text>
            </TouchableOpacity>
            );
          }}
          refreshControl={<RefreshControl refreshing={isLoadingTransactions} onRefresh={() => dispatch(fetchTransactions({ page: 1, limit: 50 }))} />}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (!isLoadingTransactions && hasMore) {
              dispatch(fetchTransactions({ page: page + 1, limit: 50 }));
            }
          }}
          ListEmptyComponent={!isLoadingTransactions ? <Text style={styles.empty}>No transactions yet.</Text> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  list: { padding: layout.screenPadding },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  itemDetails: { flex: 1 },
  itemTitle: { ...typography.bodyRegular, color: colors.text.primary, marginBottom: spacing.xs, textTransform: 'capitalize' },
  itemDate: { ...typography.caption, color: colors.text.secondary },
  itemAmount: { ...typography.label },
  plus: { color: colors.success },
  minus: { color: colors.primary },
  empty: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: spacing['4xl'] },
});

export default TransactionHistoryScreen;
