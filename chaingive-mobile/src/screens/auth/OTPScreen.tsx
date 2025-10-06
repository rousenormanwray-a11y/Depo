import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store/store';
import { verifyOTP } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface RouteParams { phoneNumber: string }

const OTPScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = (route.params as RouteParams) || { phoneNumber: '' };
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Enter the 6-digit code sent to your phone.');
      return;
    }
    try {
      await dispatch(verifyOTP({ phoneNumber, otp })).unwrap();
      Alert.alert('Verified', 'Your phone number has been verified.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Please try again');
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    Alert.alert('OTP Sent', 'A new verification code was sent.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to {phoneNumber || 'your phone'}.</Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="______"
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={cooldown > 0}>
          <Text style={styles.resendText}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { flex: 1, padding: layout.screenPadding, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyRegular, color: colors.text.secondary, marginBottom: spacing.lg, textAlign: 'center' },
  otpInput: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.md, width: 180, textAlign: 'center', backgroundColor: colors.white, ...typography.h2, letterSpacing: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', width: '100%', marginTop: spacing.lg },
  buttonDisabled: { backgroundColor: colors.gray[400] },
  buttonText: { ...typography.button, color: colors.white },
  resendText: { ...typography.bodyRegular, color: colors.primary, marginTop: spacing.md },
});

export default OTPScreen;
