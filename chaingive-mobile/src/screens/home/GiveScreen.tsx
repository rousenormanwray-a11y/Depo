import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const GiveScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [preference, setPreference] = useState<'algorithm' | 'manual'>('algorithm');
  const [location, setLocation] = useState('');
  const [faith, setFaith] = useState('');

  const obligationAmount = user?.balance ? Math.min(5000, user.balance) : 5000;

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Donation',
      `Donate ₦${obligationAmount.toLocaleString()} using ${preference === 'algorithm' ? 'smart matching' : 'manual selection'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'Donation initiated and held in escrow.') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Give Forward</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>You're ready to give</Text>
          <Text style={styles.amount}>₦{obligationAmount.toLocaleString()}</Text>
          <Text style={styles.hint}>(from your last receipt)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Choose Recipient</Text>
          <View style={styles.radioRow}>
            <TouchableOpacity style={[styles.radio, preference === 'algorithm' && styles.radioSelected]} onPress={() => setPreference('algorithm')}>
              <View style={styles.radioDot} />
            </TouchableOpacity>
            <Text style={styles.radioLabel}>Let algorithm match me</Text>
          </View>
          <View style={styles.radioRow}>
            <TouchableOpacity style={[styles.radio, preference === 'manual' && styles.radioSelected]} onPress={() => setPreference('manual')}>
              <View style={styles.radioDot} />
            </TouchableOpacity>
            <Text style={styles.radioLabel}>I'll choose</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Preferences (Optional)</Text>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Enter location preference" />
          <Text style={styles.inputLabel}>Faith Alignment</Text>
          <TextInput style={styles.input} value={faith} onChangeText={setFaith} placeholder="Enter faith preference" />
        </View>

        <View style={styles.card}>
          <Text style={styles.walletLabel}>Your wallet balance</Text>
          <Text style={styles.walletValue}>₦{(user?.balance || 0).toLocaleString()}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Text style={styles.trust}><Icon name="verified-user" size={16} color={colors.primary} /> Your donation is secured in escrow until confirmed by recipient</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
          <Text style={styles.primaryBtnText}>Confirm Donation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  scroll: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: spacing['4xl'] },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.lg, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  label: { ...typography.bodyRegular, color: colors.text.secondary },
  amount: { ...typography.h1, color: colors.text.primary, fontWeight: 'bold', marginTop: spacing.xs },
  hint: { ...typography.caption, color: colors.text.secondary },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.gray[500], alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  radioLabel: { ...typography.bodyRegular, color: colors.text.primary },
  inputLabel: { ...typography.label, color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, ...typography.bodyRegular, backgroundColor: colors.white },
  walletLabel: { ...typography.bodyRegular, color: colors.text.secondary },
  walletValue: { ...typography.h3, color: colors.text.primary, fontWeight: 'bold', marginTop: spacing.xs },
  bottom: { padding: layout.screenPadding, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border.light },
  trust: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default GiveScreen;
