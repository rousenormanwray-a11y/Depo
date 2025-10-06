import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../../store/store';
import { walletService } from '../../services/walletService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const WITHDRAWAL_FEE = 50;
const MIN_WITHDRAWAL = 500;

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);

  const userBalance = user?.balance || 0;
  const withdrawalAmount = parseInt(amount) || 0;
  const totalDeduction = withdrawalAmount + WITHDRAWAL_FEE;
  const amountToReceive = withdrawalAmount;

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleWithdraw = async () => {
    // Validation
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < MIN_WITHDRAWAL) {
      Alert.alert('Error', `Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}`);
      return;
    }

    if (totalDeduction > userBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${formatCurrency(totalDeduction)} (including ₦${WITHDRAWAL_FEE} fee) but only have ${formatCurrency(userBalance)}`
      );
      return;
    }

    if (!accountNumber || accountNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit account number');
      return;
    }

    if (!bankCode) {
      Alert.alert('Error', 'Please select a bank');
      return;
    }

    if (!accountName.trim()) {
      Alert.alert('Error', 'Please enter account name');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You will receive ${formatCurrency(amountToReceive)} in your account ${accountNumber}.\n\nProcessing time: 1-3 business days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: processWithdrawal,
        },
      ]
    );
  };

  const processWithdrawal = async () => {
    setLoading(true);
    try {
      const response = await walletService.initiateWithdrawal({
        amount: withdrawalAmount,
        bankCode,
        accountNumber,
        accountName,
      });

      Alert.alert(
        'Withdrawal Initiated',
        response.message || 'Your withdrawal request has been submitted successfully. You will receive the funds within 1-3 business days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(userBalance)}
          </Text>
          <Text style={styles.balanceHint}>
            Max withdrawal: {formatCurrency(Math.max(0, userBalance - WITHDRAWAL_FEE))}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Input
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Enter amount"
            keyboardType="numeric"
            icon="money"
            label="Withdrawal Amount (₦)"
            hint={`Min: ${formatCurrency(MIN_WITHDRAWAL)}`}
            required
          />
        </View>

        {/* Bank Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          
          <Input
            value={bankCode}
            onChangeText={setBankCode}
            placeholder="Select bank"
            icon="account-balance"
            label="Bank Name"
            required
            rightIcon="arrow-drop-down"
            onRightIconPress={() => {
              Alert.alert('Info', 'Bank selector would open here');
            }}
          />

          <Input
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Enter 10-digit account number"
            keyboardType="numeric"
            icon="payment"
            label="Account Number"
            maxLength={10}
            required
          />

          <Input
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Enter account name"
            icon="person"
            label="Account Name"
            required
          />
        </View>

        {/* Withdrawal Summary */}
        {withdrawalAmount > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Withdrawal Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(withdrawalAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(WITHDRAWAL_FEE)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Deduction:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalDeduction)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.receiveRow]}>
              <Text style={styles.receiveLabel}>You'll Receive:</Text>
              <Text style={styles.receiveValue}>
                {formatCurrency(amountToReceive)}
              </Text>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color={colors.warning} />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            • Processing fee: ₦{WITHDRAWAL_FEE}{'\n'}
            • Processing time: 1-3 business days{'\n'}
            • Ensure account details are correct{'\n'}
            • Withdrawals cannot be reversed
          </Text>
        </View>

        {/* Withdraw Button */}
        <Button
          title="Withdraw Funds"
          onPress={handleWithdraw}
          loading={loading}
          disabled={
            !amount ||
            withdrawalAmount < MIN_WITHDRAWAL ||
            totalDeduction > userBalance ||
            !accountNumber ||
            !bankCode ||
            !accountName.trim()
          }
          icon="send"
          fullWidth
          style={styles.withdrawButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: colors.warning,
    margin: layout.screenPadding,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    marginVertical: spacing.sm,
  },
  balanceHint: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginHorizontal: layout.screenPadding,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalValue: {
    ...typography.label,
    color: colors.error,
    fontWeight: 'bold',
  },
  receiveRow: {
    backgroundColor: `${colors.success}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  receiveLabel: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '600',
  },
  receiveValue: {
    ...typography.h4,
    color: colors.success,
    fontWeight: 'bold',
  },
  infoCard: {
    marginHorizontal: layout.screenPadding,
    padding: spacing.md,
    backgroundColor: `${colors.warning}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.label,
    color: colors.warning,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  withdrawButton: {
    marginHorizontal: layout.screenPadding,
  },
});

export default WithdrawScreen;
