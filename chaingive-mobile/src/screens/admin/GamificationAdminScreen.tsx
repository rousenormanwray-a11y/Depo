import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import apiClient from '../../api/client';

interface GamificationConfig {
  id: string;
  missionsEnabled: boolean;
  missionBonusReward: number;
  weekendMultiplier: number;
  streakEnabled: boolean;
  streakRewards: Record<string, number>;
  ringsEnabled: boolean;
  ringPerfectDayBonus: number;
  giveGoal: number;
  earnGoal: number;
  engageGoal: number;
  challengesEnabled: boolean;
  achievementsEnabled: boolean;
}

interface MissionTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  reward: number;
  icon: string;
  isActive: boolean;
  priority: number;
}

export default function GamificationAdminScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<GamificationConfig | null>(null);
  const [templates, setTemplates] = useState<MissionTemplate[]>([]);
  
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MissionTemplate | null>(null);
  
  // Form states
  const [missionType, setMissionType] = useState('');
  const [missionName, setMissionName] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionReward, setMissionReward] = useState('');
  const [missionIcon, setMissionIcon] = useState('check-circle');
  
  const [streakRewards, setStreakRewards] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, templatesRes] = await Promise.all([
        apiClient.get('/admin/gamification/config'),
        apiClient.get('/admin/gamification/missions'),
      ]);
      
      setConfig(configRes.data.config);
      setTemplates(templatesRes.data.templates);
      setStreakRewards(configRes.data.config.streakRewards || {});
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load gamification settings');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<GamificationConfig>) => {
    try {
      await apiClient.put('/admin/gamification/config', updates);
      Alert.alert('Success', 'Configuration updated');
      loadData();
    } catch (error) {
      console.error('Error updating config:', error);
      Alert.alert('Error', 'Failed to update configuration');
    }
  };

  const saveMissionTemplate = async () => {
    if (!missionType || !missionName || !missionDesc || !missionReward) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const payload = {
        type: missionType,
        name: missionName,
        description: missionDesc,
        reward: parseInt(missionReward),
        icon: missionIcon,
        isActive: true,
        priority: 0,
      };

      if (editingTemplate) {
        await apiClient.patch(`/admin/gamification/missions/${editingTemplate.id}`, payload);
        Alert.alert('Success', 'Mission template updated');
      } else {
        await apiClient.post('/admin/gamification/missions', payload);
        Alert.alert('Success', 'Mission template created');
      }

      setShowMissionModal(false);
      resetMissionForm();
      loadData();
    } catch (error) {
      console.error('Error saving mission template:', error);
      Alert.alert('Error', 'Failed to save mission template');
    }
  };

  const deleteMissionTemplate = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this mission template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/gamification/missions/${id}`);
              Alert.alert('Success', 'Mission template deleted');
              loadData();
            } catch (error) {
              console.error('Error deleting mission:', error);
              Alert.alert('Error', 'Failed to delete mission template');
            }
          },
        },
      ]
    );
  };

  const resetMissionForm = () => {
    setMissionType('');
    setMissionName('');
    setMissionDesc('');
    setMissionReward('');
    setMissionIcon('check-circle');
    setEditingTemplate(null);
  };

  const openEditMission = (template: MissionTemplate) => {
    setEditingTemplate(template);
    setMissionType(template.type);
    setMissionName(template.name);
    setMissionDesc(template.description);
    setMissionReward(template.reward.toString());
    setMissionIcon(template.icon);
    setShowMissionModal(true);
  };

  const saveStreakRewards = async () => {
    try {
      await apiClient.put('/admin/gamification/config', { streakRewards });
      Alert.alert('Success', 'Streak rewards updated');
      setShowStreakModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving streak rewards:', error);
      Alert.alert('Error', 'Failed to save streak rewards');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>🎛️ Gamification Control</Text>
        <Text style={styles.headerSubtitle}>Configure all gamification settings</Text>
      </LinearGradient>

      {/* Feature Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Toggles</Text>
        
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="target" size={24} color={colors.primary} />
              <Text style={styles.toggleLabel}>Daily Missions</Text>
            </View>
            <Switch
              value={config?.missionsEnabled}
              onValueChange={(value) => updateConfig({ missionsEnabled: value })}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={config?.missionsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="fire" size={24} color={colors.primary} />
              <Text style={styles.toggleLabel}>Daily Streaks</Text>
            </View>
            <Switch
              value={config?.streakEnabled}
              onValueChange={(value) => updateConfig({ streakEnabled: value })}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={config?.streakEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="circle-slice-8" size={24} color={colors.primary} />
              <Text style={styles.toggleLabel}>Progress Rings</Text>
            </View>
            <Switch
              value={config?.ringsEnabled}
              onValueChange={(value) => updateConfig({ ringsEnabled: value })}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={config?.ringsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="trophy" size={24} color={colors.primary} />
              <Text style={styles.toggleLabel}>Weekly Challenges</Text>
            </View>
            <Switch
              value={config?.challengesEnabled}
              onValueChange={(value) => updateConfig({ challengesEnabled: value })}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={config?.challengesEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="medal" size={24} color={colors.primary} />
              <Text style={styles.toggleLabel}>Achievements</Text>
            </View>
            <Switch
              value={config?.achievementsEnabled}
              onValueChange={(value) => updateConfig({ achievementsEnabled: value })}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
              thumbColor={config?.achievementsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Mission Templates */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mission Templates</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetMissionForm();
              setShowMissionModal(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {templates.map((template) => (
          <View key={template.id} style={styles.templateCard}>
            <View style={styles.templateLeft}>
              <MaterialCommunityIcons name={template.icon as any} size={24} color={colors.primary} />
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc}>{template.description}</Text>
                <Text style={styles.templateReward}>Reward: {template.reward} coins</Text>
              </View>
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity onPress={() => openEditMission(template)}>
                <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteMissionTemplate(template.id)}>
                <MaterialCommunityIcons name="delete" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowStreakModal(true)}
        >
          <MaterialCommunityIcons name="fire" size={32} color="#FFA500" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Configure Streak Rewards</Text>
            <Text style={styles.actionDesc}>Set coins for each day streak</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CreateChallenge')}
        >
          <MaterialCommunityIcons name="trophy" size={32} color="#FFD700" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Create Weekly Challenge</Text>
            <Text style={styles.actionDesc}>Set up new challenges</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ManageAchievements')}
        >
          <MaterialCommunityIcons name="medal" size={32} color={colors.primary} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Manage Achievements</Text>
            <Text style={styles.actionDesc}>Create and edit badges</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Mission Template Modal */}
      <Modal
        visible={showMissionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTemplate ? 'Edit Mission Template' : 'New Mission Template'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Mission Type (e.g., donate, buy_coins)"
              value={missionType}
              onChangeText={setMissionType}
            />

            <TextInput
              style={styles.input}
              placeholder="Mission Name"
              value={missionName}
              onChangeText={setMissionName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={missionDesc}
              onChangeText={setMissionDesc}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Reward (coins)"
              value={missionReward}
              onChangeText={setMissionReward}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Icon name (e.g., check-circle)"
              value={missionIcon}
              onChangeText={setMissionIcon}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowMissionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveMissionTemplate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Streak Rewards Modal */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Streak Rewards</Text>
            <Text style={styles.modalSubtitle}>Set coins for each day milestone</Text>

            {[1, 2, 3, 4, 5, 6, 7, 14, 30, 60, 90, 365].map((day) => (
              <View key={day} style={styles.streakRow}>
                <Text style={styles.streakDay}>Day {day}</Text>
                <TextInput
                  style={styles.streakInput}
                  value={streakRewards[day]?.toString() || ''}
                  onChangeText={(value) =>
                    setStreakRewards({ ...streakRewards, [day]: parseInt(value) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="Coins"
                />
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStreakModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveStreakRewards}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
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
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
  },
  templateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  templateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  templateReward: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
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
    gap: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    height: 80,
    textAlignVertical: 'top',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakDay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  streakInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
