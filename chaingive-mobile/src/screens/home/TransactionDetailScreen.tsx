import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchTransactionById } from '../../store/slices/walletSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface RouteParams { transactionId: string }

const TransactionDetailScreen: React.FC = () => {
  const route = useRoute();
  const { transactionId } = route.params as RouteParams;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTransaction } = useSelector((s: RootState) => s.wallet);

  React.useEffect(() => {
    dispatch(fetchTransactionById(transactionId));
  }, [dispatch, transactionId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction Detail</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Transaction ID</Text>
        <Text style={styles.value}>{transactionId}</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Type</Text>
            <Text style={styles.rowValue}>{selectedTransaction?.type || '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Status</Text>
            <Text style={styles.rowValue}>{selectedTransaction?.status || '—'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Amount</Text>
            <Text style={styles.rowValue}>{selectedTransaction ? `₦${Number(selectedTransaction.amount).toLocaleString()}` : '—'}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValue}>{selectedTransaction?.createdAt || '—'}</Text>
          </View>
        </View>
        <Text style={[styles.label, { marginTop: spacing.md }]}>Blockchain</Text>
        <Text style={styles.hint}>A link to PolygonScan will appear here when available.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: layout.screenPadding },
  label: { ...typography.caption, color: colors.text.secondary },
  value: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xs },
  hint: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  rowItem: { flex: 1 },
  rowLabel: { ...typography.caption, color: colors.text.secondary },
  rowValue: { ...typography.bodyRegular, color: colors.text.primary },
});

export default TransactionDetailScreen;
