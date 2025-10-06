import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store/store';
import { register } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const RegisterScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await dispatch(register({ firstName, lastName, phoneNumber, email, password })).unwrap();
      Alert.alert('Success', 'Account created. Please verify OTP.');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Icon name="person-add" size={48} color={colors.primary} />
            <Text style={styles.title}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Enter first name" />

            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Enter last name" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email" autoCapitalize="none" />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" keyboardType="phone-pad" />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  keyboardAvoid: { flex: 1 },
  content: { padding: layout.screenPadding, paddingBottom: spacing['4xl'] },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text.primary, marginTop: spacing.sm },
  form: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border.medium, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.md, ...typography.bodyRegular, backgroundColor: colors.white },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.gray[400] },
  buttonText: { ...typography.button, color: colors.white },
});

export default RegisterScreen;
