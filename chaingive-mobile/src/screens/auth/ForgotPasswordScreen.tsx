import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    Alert.alert('Password Reset', 'If an account exists, a reset link has been sent.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="lock-reset" size={32} color={colors.primary} />
        <Text style={styles.title}>Reset Password</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" autoCapitalize="none" />
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary, padding: layout.screenPadding },
  header: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text.primary, marginTop: spacing.sm },
  form: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md, ...typography.bodyRegular },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  buttonText: { ...typography.button, color: colors.white },
});

export default ForgotPasswordScreen;
