import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store/store';
import { fetchMarketplaceItems, setSelectedCategory, setSearchQuery } from '../../store/slices/marketplaceSlice';
import { MarketplaceItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import Skeleton from '../../components/common/Skeleton';
import { TextInput } from 'react-native-gesture-handler';

const categories = ['all', 'airtime', 'data', 'vouchers', 'services'] as const;

type Category = typeof categories[number];

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { filteredItems, selectedCategory, loading, page, hasMore } = useSelector((s: RootState) => s.marketplace);
  const [query, setQuery] = useState('');
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => { dispatch(fetchMarketplaceItems()); }, [dispatch]);
  useEffect(() => { dispatch(fetchMarketplaceItems()); }, [dispatch, selectedCategory]);

  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(setSearchQuery(query));
      dispatch(fetchMarketplaceItems());
    }, 300);
    if (query.length === 0) {
      dispatch(setSearchQuery(''));
      dispatch(fetchMarketplaceItems());
    }
    return () => clearTimeout(id);
  }, [dispatch, query]);

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>💰 {item.price} CC</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>⭐ {item.rating.toFixed(1)} ({item.reviewCount})</Text>
        <Text style={[styles.stock, { color: item.inStock ? colors.success : colors.error }]}>
          {item.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const balance = user?.charityCoins || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.balanceBadge}>
          <Icon name="stars" size={14} color={colors.white} />
          <Text style={styles.balanceText}>{balance} Coins</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items or vendors"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filters}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, (selectedCategory ?? 'all') === (cat === 'all' ? null : cat) && styles.filterSelected]}
            onPress={() => dispatch(setSelectedCategory(cat === 'all' ? null : cat))}
          >
            <Text style={[styles.filterText, (selectedCategory ?? 'all') === (cat === 'all' ? null : cat) && styles.filterTextSelected]}>
              {cat[0].toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.card, { width: '48%' }]}> 
              <Skeleton height={90} />
              <Skeleton height={16} style={{ marginTop: spacing.xs }} />
              <Skeleton height={14} style={{ marginTop: spacing.xs, width: '60%' }} />
            </View>
          ))}
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySubtitle}>Try a different search or category.</Text>
        </View>
      ) : (
        <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshing={loading}
        onRefresh={() => dispatch(fetchMarketplaceItems({ page: 1 }))}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (!loading && hasMore) {
            dispatch(fetchMarketplaceItems({ page: page + 1 }));
          }
        }}
      />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  balanceText: { ...typography.caption, color: colors.white, marginLeft: spacing.xs },
  filters: { flexDirection: 'row', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.sm },
  searchRow: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.sm },
  searchInput: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...typography.bodyRegular },
  filterChip: { backgroundColor: colors.gray[100], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 16, marginRight: spacing.xs },
  filterSelected: { backgroundColor: colors.primary },
  filterText: { ...typography.caption, color: colors.text.secondary },
  filterTextSelected: { color: colors.white, fontWeight: '600' },
  list: { padding: layout.screenPadding },
  skeletonGrid: { padding: layout.screenPadding, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: spacing['4xl'] },
  emptyTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.sm },
  emptySubtitle: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.sm, marginBottom: spacing.sm, width: '48%', shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  image: { width: '100%', height: 90, borderRadius: 8, backgroundColor: colors.gray[100], marginBottom: spacing.xs },
  name: { ...typography.bodyRegular, color: colors.text.primary },
  price: { ...typography.label, color: colors.text.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.text.secondary },
  stock: { ...typography.caption },
});

export default MarketplaceScreen;
