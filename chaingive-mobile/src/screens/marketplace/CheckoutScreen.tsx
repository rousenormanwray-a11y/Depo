import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store/store';
import { redeemItem } from '../../store/slices/marketplaceSlice';
import { MarketplaceItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface RouteParams {
  itemId: string;
  quantity: number;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId, quantity } = route.params as RouteParams;
  
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.marketplace);
  const { user } = useSelector((state: RootState) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const item = items.find(item => item.id === itemId);

  useEffect(() => {
    if (!item) {
      Alert.alert('Error', 'Item not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [item, navigation]);

  const handleRedeem = async () => {
    if (!item) return;

    // Validation
    if (item.category === 'airtime' || item.category === 'data') {
      if (!phoneNumber.trim()) {
        Alert.alert('Error', 'Phone number is required for airtime/data redemption');
        return;
      }
    }

    if (item.category === 'vouchers' && !email.trim()) {
      Alert.alert('Error', 'Email is required for voucher redemption');
      return;
    }

    if (item.category === 'services' && !address.trim()) {
      Alert.alert('Error', 'Address is required for service redemption');
      return;
    }

    const deliveryInfo: any = {};
    if (phoneNumber.trim()) deliveryInfo.phoneNumber = phoneNumber.trim();
    if (email.trim()) deliveryInfo.email = email.trim();
    if (address.trim()) deliveryInfo.address = address.trim();

    Alert.alert(
      'Confirm Redemption',
      `Are you sure you want to redeem ${quantity}x ${item.name} for ${item.price * quantity} Charity Coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await dispatch(redeemItem({
                itemId,
                quantity,
                deliveryInfo,
              })).unwrap();

              Alert.alert(
                'Success!',
                'Your redemption has been processed. You will receive confirmation shortly.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('RedemptionHistory');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to process redemption. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalCoins = item.price * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Summary */}
          <View style={styles.itemSummary}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price per item:</Text>
                <Text style={styles.priceValue}>{item.price} CC</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Quantity:</Text>
                <Text style={styles.priceValue}>{quantity}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{totalCoins} CC</Text>
              </View>
            </View>
          </View>

          {/* Delivery Information */}
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            
            {(item.category === 'airtime' || item.category === 'data') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                <Text style={styles.inputHint}>
                  The airtime/data will be sent to this number
                </Text>
              </View>
            )}

            {item.category === 'vouchers' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHint}>
                  The voucher code will be sent to this email
                </Text>
              </View>
            )}

            {item.category === 'services' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Delivery Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter delivery address"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.inputHint}>
                  Service will be delivered to this address
                </Text>
              </View>
            )}

            {/* Optional fields */}
            {item.category !== 'airtime' && item.category !== 'data' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            )}

            {item.category !== 'vouchers' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              • Redemptions are final and cannot be reversed{'\n'}
              • Processing time may vary depending on the item type{'\n'}
              • You will receive confirmation once the redemption is processed{'\n'}
              • Contact support if you don't receive your item within 24 hours
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <View style={styles.totalSummary}>
            <Text style={styles.totalSummaryLabel}>Total Cost:</Text>
            <Text style={styles.totalSummaryValue}>{totalCoins} Charity Coins</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.redeemButton,
              (isProcessing || loading) && styles.disabledButton,
            ]}
            onPress={handleRedeem}
            disabled={isProcessing || loading}
          >
            {isProcessing ? (
              <Text style={styles.redeemButtonText}>Processing...</Text>
            ) : (
              <>
                <Icon name="redeem" size={20} color={colors.white} />
                <Text style={styles.redeemButtonText}>Redeem Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.bodyRegular,
    color: colors.error,
    marginTop: spacing.md,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  itemSummary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
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
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  priceValue: {
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
    ...typography.h4,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  deliverySection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 80,
  },
  inputHint: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  termsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
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
  termsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalSummaryLabel: {
    ...typography.h4,
    color: colors.text.primary,
  },
  totalSummaryValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  redeemButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.gray[400],
  },
  redeemButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default CheckoutScreen;