import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const data = [
  { id: '1', type: 'deposit', amount: 5000, date: 'Today, 2:30 PM' },
  { id: '2', type: 'donation_sent', amount: 2000, date: 'Yesterday, 4:15 PM' },
  { id: '3', type: 'redemption', amount: 50, date: '2 days ago' },
];

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const icon = iconFor(item.type);
          return (
            <View style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: `${icon.color}20` }]}>
                <Icon name={icon.name} size={20} color={icon.color} />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.type.replace('_', ' ')}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>
              <Text style={[styles.itemAmount, item.type === 'deposit' ? styles.plus : styles.minus]}>
                {item.type === 'redemption' ? `- ${item.amount} CC` : `${item.type === 'deposit' ? '+' : '-'}₦${item.amount.toLocaleString()}`}
              </Text>
            </View>
          );
        }}
      />
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
});

export default TransactionHistoryScreen;
