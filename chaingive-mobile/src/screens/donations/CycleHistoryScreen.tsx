import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCycles } from '../../store/slices/donationSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const CycleHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cycles, isLoadingCycles } = useSelector((s: RootState) => s.donation);

  useEffect(() => {
    dispatch(fetchCycles({ page: 1, limit: 50 }));
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cycle History</Text>
      </View>

      <FlatList
        data={cycles as any}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.id}</Text>
            <Text style={styles.itemMeta}>₦{Number(item.amount).toLocaleString()} • {item.status} • Due {item.dueDate}</Text>
          </View>
        )}
        ListEmptyComponent={!isLoadingCycles ? <Text style={styles.empty}>No cycles yet.</Text> : null}
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
  empty: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
});

export default CycleHistoryScreen;
