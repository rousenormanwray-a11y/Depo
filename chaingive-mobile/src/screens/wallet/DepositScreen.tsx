import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
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

type PaymentMethod = 'FLUTTERWAVE' | 'PAYSTACK' | 'OPAY' | 'PALMPAY' | 'BANK_TRANSFER';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'FLUTTERWAVE',
    name: 'Flutterwave',
    icon: 'payment',
    description: 'Card, Bank Transfer, USSD',
    color: colors.primary,
  },
  {
    id: 'PAYSTACK',
    name: 'Paystack',
    icon: 'credit-card',
    description: 'Debit/Credit Card',
    color: colors.info,
  },
  {
    id: 'OPAY',
    name: 'OPay',
    icon: 'account-balance-wallet',
    description: 'OPay Wallet',
    color: '#00C087',
  },
  {
    id: 'PALMPAY',
    name: 'PalmPay',
    icon: 'account-balance-wallet',
    description: 'PalmPay Wallet',
    color: '#6C63FF',
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    icon: 'account-balance',
    description: 'Manual Bank Transfer',
    color: colors.secondary,
  },
];

const DepositScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestedAmounts = [1000, 5000, 10000, 20000];

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

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount);

    if (!depositAmount || depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (depositAmount < 100) {
      Alert.alert('Error', 'Minimum deposit amount is ₦100');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const response = await walletService.initiateDeposit({
        amount: depositAmount,
        paymentMethod: selectedMethod,
      });

      if (response.paymentUrl) {
        // Open payment URL for online payment methods
        const supported = await Linking.canOpenURL(response.paymentUrl);
        if (supported) {
          await Linking.openURL(response.paymentUrl);
          
          Alert.alert(
            'Payment Initiated',
            'Complete the payment in your browser. Your wallet will be credited automatically.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        // Bank transfer - show account details
        Alert.alert(
          'Bank Transfer Details',
          `Transfer ${formatCurrency(depositAmount)} to:\n\nBank: GTBank\nAccount: 0123456789\nName: ChainGive Escrow\n\nReference: ${response.reference}\n\nAfter transfer, upload proof of payment.`,
          [
            {
              text: 'Upload Proof',
              onPress: () => {
                navigation.navigate('UploadProof', {
                  reference: response.reference,
                  amount: depositAmount,
                });
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate deposit');
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
          <Text style={styles.headerTitle}>Deposit Funds</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(user?.balance || 0)}
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
            label="Amount (₦)"
            required
          />

          {/* Suggested Amounts */}
          <Text style={styles.suggestedLabel}>Quick amounts:</Text>
          <View style={styles.suggestedAmounts}>
            {suggestedAmounts.map((suggested) => (
              <TouchableOpacity
                key={suggested}
                style={[
                  styles.suggestedButton,
                  amount === suggested.toString() && styles.suggestedButtonActive,
                ]}
                onPress={() => setAmount(suggested.toString())}
              >
                <Text
                  style={[
                    styles.suggestedButtonText,
                    amount === suggested.toString() && styles.suggestedButtonTextActive,
                  ]}
                >
                  {formatCurrency(suggested)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {PAYMENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paymentOption,
                selectedMethod === option.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedMethod(option.id)}
            >
              <View style={[styles.paymentIcon, { backgroundColor: `${option.color}20` }]}>
                <Icon name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{option.name}</Text>
                <Text style={styles.paymentDescription}>{option.description}</Text>
              </View>
              <Icon
                name={selectedMethod === option.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color={selectedMethod === option.id ? colors.primary : colors.gray[400]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color={colors.info} />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            • No deposit fees{'\n'}
            • Instant credit for online payments{'\n'}
            • Bank transfers may take 10-30 minutes{'\n'}
            • Keep your transaction reference safe
          </Text>
        </View>

        {/* Deposit Button */}
        <Button
          title={`Deposit ${amount ? formatCurrency(parseInt(amount)) : '₦0'}`}
          onPress={handleDeposit}
          loading={loading}
          disabled={!amount || parseInt(amount) <= 0 || !selectedMethod}
          icon="add-circle"
          fullWidth
          style={styles.depositButton}
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
    backgroundColor: colors.success,
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
    marginTop: spacing.sm,
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
  suggestedLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  suggestedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestedButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  suggestedButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  suggestedButtonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  suggestedButtonTextActive: {
    color: colors.white,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}05`,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  paymentDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  infoCard: {
    marginHorizontal: layout.screenPadding,
    padding: spacing.md,
    backgroundColor: `${colors.info}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.info}30`,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.label,
    color: colors.info,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  depositButton: {
    marginHorizontal: layout.screenPadding,
  },
});

export default DepositScreen;
