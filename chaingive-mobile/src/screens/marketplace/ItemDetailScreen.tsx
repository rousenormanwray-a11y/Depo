import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface RouteParams { itemId: string }

const ItemDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params as RouteParams;
  const { items } = useSelector((s: RootState) => s.marketplace);

  const item = items.find((i) => i.id === itemId);
  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}> 
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.emptyText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>⭐ {item.rating.toFixed(1)} ({item.reviewCount})</Text>
          <Text style={[styles.meta, { color: item.inStock ? colors.success : colors.error }]}>
            {item.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>
        <Text style={styles.price}>💰 {item.price} CC</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={[styles.primaryBtn, !item.inStock && styles.disabledBtn]} disabled={!item.inStock} onPress={() => navigation.navigate('Checkout', { itemId: item.id, quantity: 1 })}>
          <Icon name="shopping-cart" size={20} color={colors.white} />
          <Text style={styles.primaryBtnText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: layout.screenPadding },
  image: { width: '100%', height: 180, borderRadius: 12, backgroundColor: colors.gray[100], marginBottom: spacing.md },
  name: { ...typography.h2, color: colors.text.primary },
  description: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.text.secondary },
  price: { ...typography.h3, color: colors.primary, marginTop: spacing.md, fontWeight: 'bold' },
  bottom: { padding: layout.screenPadding, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border.light },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  disabledBtn: { backgroundColor: colors.gray[400] },
  primaryBtnText: { ...typography.button, color: colors.white, marginLeft: spacing.xs },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.sm },
});

export default ItemDetailScreen;
