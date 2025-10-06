import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { withdrawFunds } from '../../store/slices/walletSlice';
import InlineError from '../../components/common/InlineError';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { isProcessing } = useSelector((s: RootState) => s.wallet);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid positive amount.');
      return;
    }
    if (!accountNumber.trim() || accountNumber.trim().length !== 10) {
      Alert.alert('Invalid account', 'Enter a valid 10-digit account number.');
      return;
    }
    if (!bankCode.trim()) {
      Alert.alert('Missing bank', 'Enter a valid bank code.');
      return;
    }
    try {
      await dispatch(withdrawFunds({ amount: amt, accountNumber: accountNumber.trim(), bankCode: bankCode.trim() })).unwrap();
      Alert.alert('Withdrawal Requested', `₦${amt.toLocaleString()} to ${accountNumber}. Fee ₦50.`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Withdraw Failed', e.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Amount (₦)</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" />
        {(!amount || Number(amount) <= 0) && <InlineError message="Enter a positive amount" />}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Bank Account Number</Text>
        <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" placeholder="10-digit account number" maxLength={10} />
        {(!accountNumber.trim() || accountNumber.length !== 10) && (
          <InlineError message="Enter a valid 10-digit Nigerian account number" />
        )}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Bank Code</Text>
        <TextInput style={styles.input} value={bankCode} onChangeText={setBankCode} placeholder="e.g., 058" />
        {!bankCode.trim() && (
          <InlineError message="Bank code required (e.g., GTBank 058)" />
        )}

        <Text style={styles.hint}>A ₦50 processing fee applies. Withdrawals processed within 24 hours.</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleWithdraw}>
          <Text style={styles.primaryBtnText}>{isProcessing ? 'Processing…' : 'Request Withdrawal'}</Text>
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
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, backgroundColor: colors.white, ...typography.bodyRegular },
  hint: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.sm },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default WithdrawScreen;
