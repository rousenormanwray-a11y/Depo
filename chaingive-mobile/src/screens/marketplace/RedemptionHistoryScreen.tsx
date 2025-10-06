import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { RootState } from '../../store/store';
import { fetchRedemptions } from '../../store/slices/marketplaceSlice';

const RedemptionHistoryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { redemptions } = useSelector((s: RootState) => s.marketplace);
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (user) {
      // @ts-ignore - simple dispatch without AppDispatch typing here
      dispatch(fetchRedemptions(user.id));
    }
  }, [dispatch, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Redemption History</Text>
      </View>

      <FlatList
        data={redemptions}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.itemId}</Text>
            <Text style={styles.itemMeta}>Qty: {item.quantity} • {item.totalCoins} CC • {item.status}</Text>
            {item.voucherCode && (
              <Text style={styles.voucher}>Code: {item.voucherCode}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No redemptions yet.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  list: { padding: layout.screenPadding },
  item: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  itemTitle: { ...typography.bodyRegular, color: colors.text.primary },
  itemMeta: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  voucher: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  empty: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
});

export default RedemptionHistoryScreen;
