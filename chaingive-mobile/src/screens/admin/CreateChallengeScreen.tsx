import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import apiClient from '../../api/client';

export default function CreateChallengeScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('donate');
  const [targetValue, setTargetValue] = useState('');
  const [rewardCoins, setRewardCoins] = useState('');
  const [duration, setDuration] = useState('7'); // days
  const [saving, setSaving] = useState(false);

  const challengeTypes = [
    { value: 'donate', label: 'Donations', icon: 'gift' },
    { value: 'coins', label: 'Coin Purchases', icon: 'coin' },
    { value: 'referrals', label: 'Referrals', icon: 'account-group' },
    { value: 'streak', label: 'Streak Days', icon: 'fire' },
    { value: 'perfect_days', label: 'Perfect Days', icon: 'check-circle' },
  ];

  const createChallenge = async () => {
    if (!name || !description || !targetValue || !rewardCoins) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(duration));

      await apiClient.post('/admin/gamification/challenges', {
        name,
        description,
        type,
        targetValue: parseInt(targetValue),
        rewardCoins: parseInt(rewardCoins),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      Alert.alert('Success', 'Weekly challenge created!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', 'Failed to create challenge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Weekly Challenge</Text>
        <Text style={styles.headerSubtitle}>Set goals and rewards for users</Text>
      </LinearGradient>

      <View style={styles.form}>
        {/* Challenge Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Challenge Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Donation Master"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what users need to do"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Challenge Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Challenge Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {challengeTypes.map((ct) => (
              <TouchableOpacity
                key={ct.value}
                style={[styles.typeChip, type === ct.value && styles.typeChipActive]}
                onPress={() => setType(ct.value)}
              >
                <MaterialCommunityIcons
                  name={ct.icon as any}
                  size={20}
                  color={type === ct.value ? '#FFF' : colors.text}
                />
                <Text style={[styles.typeLabel, type === ct.value && styles.typeLabelActive]}>
                  {ct.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Target Value */}
        <View style={styles.field}>
          <Text style={styles.label}>Target Value *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 20 (for 20 donations)"
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>How many {type}s required to complete</Text>
        </View>

        {/* Reward Coins */}
        <View style={styles.field}>
          <Text style={styles.label}>Reward (Coins) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={rewardCoins}
            onChangeText={setRewardCoins}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Coins awarded on completion</Text>
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <Text style={styles.label}>Duration (Days)</Text>
          <View style={styles.durationButtons}>
            {['7', '14', '30'].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.durationButton, duration === days && styles.durationButtonActive]}
                onPress={() => setDuration(days)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === days && styles.durationTextActive,
                  ]}
                >
                  {days} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <MaterialCommunityIcons
                name={challengeTypes.find((ct) => ct.value === type)?.icon as any}
                size={32}
                color={colors.primary}
              />
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{name || 'Challenge Name'}</Text>
                <Text style={styles.previewDesc}>{description || 'Description'}</Text>
              </View>
            </View>
            <View style={styles.previewStats}>
              <Text style={styles.previewStat}>Target: {targetValue || '0'}</Text>
              <Text style={styles.previewStat}>Reward: {rewardCoins || '0'} coins</Text>
              <Text style={styles.previewStat}>Duration: {duration} days</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, saving && styles.createButtonDisabled]}
            onPress={createChallenge}
            disabled={saving}
          >
            <Text style={styles.createButtonText}>
              {saving ? 'Creating...' : 'Create Challenge'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  typeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  typeLabelActive: {
    color: '#FFF',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  durationTextActive: {
    color: '#FFF',
  },
  preview: {
    marginTop: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
