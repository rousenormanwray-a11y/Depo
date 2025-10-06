import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const KYCVerificationScreen: React.FC = () => {
  const handleStart = () => {
    Alert.alert('KYC', 'KYC flow will be implemented with provider integration.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security & KYC</Text>
      </View>

      <View style={styles.card}>
        <Icon name="security" size={32} color={colors.primary} />
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>Complete KYC to unlock higher limits and agent features.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
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
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, margin: layout.screenPadding, alignItems: 'center' },
  title: { ...typography.h2, color: colors.text.primary, marginTop: spacing.sm },
  subtitle: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },
  primaryBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', alignSelf: 'stretch' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default KYCVerificationScreen;
