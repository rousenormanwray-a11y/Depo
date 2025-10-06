import React, { useEffect } from 'react';
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

const categories = ['all', 'airtime', 'data', 'vouchers', 'services'] as const;

type Category = typeof categories[number];

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { filteredItems, selectedCategory, loading } = useSelector((s: RootState) => s.marketplace);
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => { dispatch(fetchMarketplaceItems()); }, [dispatch]);

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

      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshing={loading}
        onRefresh={() => dispatch(fetchMarketplaceItems())}
      />
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
  filterChip: { backgroundColor: colors.gray[100], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 16, marginRight: spacing.xs },
  filterSelected: { backgroundColor: colors.primary },
  filterText: { ...typography.caption, color: colors.text.secondary },
  filterTextSelected: { color: colors.white, fontWeight: '600' },
  list: { padding: layout.screenPadding },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.sm, marginBottom: spacing.sm, width: '48%', shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  image: { width: '100%', height: 90, borderRadius: 8, backgroundColor: colors.gray[100], marginBottom: spacing.xs },
  name: { ...typography.bodyRegular, color: colors.text.primary },
  price: { ...typography.label, color: colors.text.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.text.secondary },
  stock: { ...typography.caption },
});

export default MarketplaceScreen;
