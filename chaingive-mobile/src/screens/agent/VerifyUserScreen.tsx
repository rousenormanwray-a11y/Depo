import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const VerifyUserScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleVerify = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Enter a phone number to verify');
      return;
    }
    Alert.alert('Verification', 'User lookup and verification flow pending backend integration.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verify User</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="Enter phone number" />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify}>
          <Text style={styles.primaryBtnText}>Start Verification</Text>
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

export default VerifyUserScreen;
