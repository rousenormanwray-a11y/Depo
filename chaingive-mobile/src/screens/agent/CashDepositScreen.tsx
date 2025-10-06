import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const CashDepositScreen: React.FC = () => {
  const [lookupPhone, setLookupPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!lookupPhone.trim() || !amount || Number(amount) <= 0) {
      Alert.alert('Error', 'Enter a valid phone and amount.');
      return;
    }
    const commission = Number(amount) * 0.02;
    Alert.alert('Deposit Logged', `Commission: ₦${commission.toFixed(2)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cash Deposit</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>User Phone</Text>
        <TextInput style={styles.input} value={lookupPhone} onChangeText={setLookupPhone} keyboardType="phone-pad" placeholder="Enter user phone" />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Amount (₦)</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.primaryBtnText}>Log Deposit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  form: { padding: layout.screenPadding },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, backgroundColor: colors.white, ...typography.bodyRegular },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default CashDepositScreen;
