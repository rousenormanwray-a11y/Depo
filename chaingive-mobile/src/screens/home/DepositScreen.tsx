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
import InlineError from '../../components/common/InlineError';
import { depositFunds } from '../../store/slices/walletSlice';

const DepositScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { isProcessing } = useSelector((s: RootState) => s.wallet);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Flutterwave');

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid positive amount.');
      return;
    }
    try {
      await dispatch(depositFunds({ amount: amt, method })).unwrap();
      Alert.alert('Deposit Initiated', `₦${amt.toLocaleString()} via ${method}.`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Deposit Failed', e.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Amount (₦)</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" />
        {(!amount || Number(amount) <= 0) && <InlineError message="Enter a positive amount" />}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Payment Method</Text>
        <TextInput style={styles.input} value={method} onChangeText={setMethod} placeholder="Flutterwave / Paystack / Bank Transfer" />
        {!method.trim() && (
          <InlineError message="Choose a payment method like Flutterwave or Paystack" />
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleDeposit}>
          <Text style={styles.primaryBtnText}>{isProcessing ? 'Processing…' : 'Continue'}</Text>
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
  hint: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default DepositScreen;
