import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import apiClient from '../../api/client';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  requirementType: string;
  requirementValue: number;
  rewardCoins: number;
  tier: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export default function ManageAchievementsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('donations');
  const [requirementType, setRequirementType] = useState('donation_count');
  const [requirementValue, setRequirementValue] = useState('');
  const [rewardCoins, setRewardCoins] = useState('');
  const [tier, setTier] = useState('bronze');
  const [icon, setIcon] = useState('gift');
  const [achievementColor, setAchievementColor] = useState('#FFD700');

  const categories = [
    { value: 'donations', label: 'Donations' },
    { value: 'streaks', label: 'Streaks' },
    { value: 'referrals', label: 'Referrals' },
    { value: 'coins', label: 'Coins' },
    { value: 'special', label: 'Special' },
  ];

  const tiers = [
    { value: 'bronze', label: 'Bronze', color: '#CD7F32' },
    { value: 'silver', label: 'Silver', color: '#C0C0C0' },
    { value: 'gold', label: 'Gold', color: '#FFD700' },
    { value: 'platinum', label: 'Platinum', color: '#E5E4E2' },
    { value: 'diamond', label: 'Diamond', color: '#B9F2FF' },
  ];

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/gamification/achievements');
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const saveAchievement = async () => {
    if (!code || !name || !description || !requirementValue || !rewardCoins) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const payload = {
        code,
        name,
        description,
        category,
        requirementType,
        requirementValue: parseInt(requirementValue),
        rewardCoins: parseInt(rewardCoins),
        tier,
        icon,
        color: achievementColor,
      };

      if (editingAchievement) {
        await apiClient.patch(`/admin/gamification/achievements/${editingAchievement.id}`, payload);
        Alert.alert('Success', 'Achievement updated!');
      } else {
        await apiClient.post('/admin/gamification/achievements', payload);
        Alert.alert('Success', 'Achievement created!');
      }

      setShowModal(false);
      resetForm();
      loadAchievements();
    } catch (error) {
      console.error('Error saving achievement:', error);
      Alert.alert('Error', 'Failed to save achievement');
    }
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setCategory('donations');
    setRequirementType('donation_count');
    setRequirementValue('');
    setRewardCoins('');
    setTier('bronze');
    setIcon('gift');
    setAchievementColor('#FFD700');
    setEditingAchievement(null);
  };

  const openEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setCode(achievement.code);
    setName(achievement.name);
    setDescription(achievement.description);
    setCategory(achievement.category);
    setRequirementType(achievement.requirementType);
    setRequirementValue(achievement.requirementValue.toString());
    setRewardCoins(achievement.rewardCoins.toString());
    setTier(achievement.tier);
    setIcon(achievement.icon);
    setAchievementColor(achievement.color);
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Achievements</Text>
          <Text style={styles.headerSubtitle}>{achievements.length} total badges</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementCard}
            onPress={() => openEdit(achievement)}
          >
            <View
              style={[
                styles.badge,
                { backgroundColor: tiers.find((t) => t.value === achievement.tier)?.color || '#FFD700' },
              ]}
            >
              <MaterialCommunityIcons name={achievement.icon as any} size={32} color="#FFF" />
            </View>

            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              <View style={styles.achievementMeta}>
                <Text style={styles.achievementTier}>{achievement.tier.toUpperCase()}</Text>
                <Text style={styles.achievementReward}>+{achievement.rewardCoins} coins</Text>
              </View>
            </View>

            <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAchievement ? 'Edit Achievement' : 'New Achievement'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Code (e.g., gold_giver)"
              value={code}
              onChangeText={setCode}
              editable={!editingAchievement}
            />

            <TextInput
              style={styles.input}
              placeholder="Name (e.g., Gold Giver)"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.chip, category === cat.value && styles.chipActive]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Requirement Value (e.g., 100)"
              value={requirementValue}
              onChangeText={setRequirementValue}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Reward Coins (e.g., 1000)"
              value={rewardCoins}
              onChangeText={setRewardCoins}
              keyboardType="numeric"
            />

            {/* Tier */}
            <Text style={styles.fieldLabel}>Tier</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tiers.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.tierChip,
                    { borderColor: t.color },
                    tier === t.value && { backgroundColor: t.color },
                  ]}
                  onPress={() => {
                    setTier(t.value);
                    setAchievementColor(t.color);
                  }}
                >
                  <Text
                    style={[styles.tierText, tier === t.value && { color: '#FFF' }]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Icon name (e.g., gift, trophy)"
              value={icon}
              onChangeText={setIcon}
            />

            {/* Preview */}
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={[styles.previewBadge, { backgroundColor: achievementColor }]}>
                <MaterialCommunityIcons name={icon as any} size={48} color="#FFF" />
              </View>
              <Text style={styles.previewName}>{name || 'Achievement Name'}</Text>
              <Text style={styles.previewDesc}>{description || 'Description'}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveAchievement}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementTier: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  achievementReward: {
    fontSize: 12,
    color: '#B8860B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 16,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: '#FFF',
  },
  tierChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFF',
    marginRight: 8,
    marginBottom: 16,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  previewBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
