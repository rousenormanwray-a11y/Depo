import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import InlineError from '../../components/common/InlineError';
import { AppDispatch } from '../../store/store';
import { authAPI } from '../../api/auth';

const ResetPasswordScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async () => {
    setSubmitted(true);
    if (!token.trim() || !password.trim() || !confirm.trim() || password !== confirm) return;
    try {
      await authAPI.resetPassword({ token: token.trim(), password: password.trim() });
      Alert.alert('Success', 'Your password has been reset. You can now log in.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not reset password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Set New Password</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Reset Token</Text>
        <TextInput style={styles.input} value={token} onChangeText={setToken} placeholder="Paste reset token" autoCapitalize="none" />
        {submitted && !token.trim() && <InlineError message="Token is required" />}

        <Text style={[styles.label, { marginTop: spacing.md }]}>New Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter new password" secureTextEntry />
        {submitted && !password.trim() && <InlineError message="Password is required" />}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Confirm Password</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder="Confirm new password" secureTextEntry />
        {submitted && password !== confirm && <InlineError message="Passwords do not match" />}

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  form: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, margin: layout.screenPadding },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, backgroundColor: colors.white, ...typography.bodyRegular },
  button: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  buttonText: { ...typography.button, color: colors.white },
});

export default ResetPasswordScreen;
