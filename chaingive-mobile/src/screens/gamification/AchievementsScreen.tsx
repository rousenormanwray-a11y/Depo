import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchAllAchievements, fetchUnlockedAchievements } from '../../store/slices/gamificationSlice';
import type { RootState, AppDispatch } from '../../store/store';
import type { Achievement } from '../../api/gamification';
import { colors } from '../../theme/colors';

type Category = 'all' | 'donations' | 'streaks' | 'referrals' | 'coins' | 'special';

export default function AchievementsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { achievements, unlockedAchievements, achievementsLoading } = useSelector(
    (state: RootState) => state.gamification
  );
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    await Promise.all([
      dispatch(fetchAllAchievements()),
      dispatch(fetchUnlockedAchievements()),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const categories: { key: Category; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'view-grid' },
    { key: 'donations', label: 'Giving', icon: 'gift' },
    { key: 'streaks', label: 'Streaks', icon: 'fire' },
    { key: 'referrals', label: 'Social', icon: 'account-group' },
    { key: 'coins', label: 'Coins', icon: 'coin' },
    { key: 'special', label: 'Special', icon: 'star' },
  ];

  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond':
        return '#B9F2FF';
      case 'platinum':
        return '#E5E4E2';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return '#CD7F32';
    }
  };

  const handleAchievementPress = (achievement: Achievement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAchievement(achievement);
    setShowUnlockModal(true);
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const isUnlocked = unlockedIds.has(achievement.id);
    const tierColor = getTierColor(achievement.tier);

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.8}
      >
        <View style={[styles.badgeContainer, { backgroundColor: isUnlocked ? tierColor : '#E5E5E5' }]}>
          <MaterialCommunityIcons
            name={isUnlocked ? (achievement.icon as any) : 'lock'}
            size={40}
            color={isUnlocked ? '#FFF' : '#999'}
          />
        </View>

        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementName, !isUnlocked && styles.achievementNameLocked]}>
            {isUnlocked || !achievement.isSecret ? achievement.name : '🔒 Secret Achievement'}
          </Text>
          <Text style={styles.achievementDescription}>
            {isUnlocked || !achievement.isSecret ? achievement.description : 'Complete to unlock'}
          </Text>

          {isUnlocked && (
            <View style={styles.rewardBadge}>
              <MaterialCommunityIcons name="coin" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>+{achievement.rewardCoins}</Text>
            </View>
          )}
        </View>

        {isUnlocked && (
          <View style={styles.checkmark}>
            <MaterialCommunityIcons name="check-circle" size={28} color={colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (achievementsLoading && achievements.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Achievements</Text>
          <Text style={styles.headerSubtitle}>Collect badges and earn rewards</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {unlockedCount} / {totalCount} Unlocked ({Math.round(completionPercentage)}%)
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {unlockedAchievements.reduce((sum, ua) => sum + ua.achievement.rewardCoins, 0)}
            </Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCount - unlockedCount}</Text>
            <Text style={styles.statLabel}>To Unlock</Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(category.key);
              }}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.key ? '#FFF' : colors.text}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.key && styles.categoryChipTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(renderAchievementCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="trophy-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No achievements in this category</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        visible={showUnlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <LinearGradient
                  colors={[getTierColor(selectedAchievement.tier), '#FFF']}
                  style={styles.modalHeader}
                >
                  <View
                    style={[
                      styles.modalBadge,
                      { backgroundColor: getTierColor(selectedAchievement.tier) },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        unlockedIds.has(selectedAchievement.id)
                          ? (selectedAchievement.icon as any)
                          : 'lock'
                      }
                      size={64}
                      color="#FFF"
                    />
                  </View>
                </LinearGradient>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>
                    {unlockedIds.has(selectedAchievement.id) || !selectedAchievement.isSecret
                      ? selectedAchievement.name
                      : '🔒 Secret Achievement'}
                  </Text>
                  <Text style={styles.modalDescription}>
                    {unlockedIds.has(selectedAchievement.id) || !selectedAchievement.isSecret
                      ? selectedAchievement.description
                      : 'Complete the requirement to unlock this achievement'}
                  </Text>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStat}>
                      <MaterialCommunityIcons name="coin" size={24} color="#FFD700" />
                      <Text style={styles.modalStatValue}>+{selectedAchievement.rewardCoins}</Text>
                      <Text style={styles.modalStatLabel}>Reward</Text>
                    </View>

                    <View style={styles.modalStat}>
                      <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
                      <Text style={styles.modalStatValue}>{selectedAchievement.tier}</Text>
                      <Text style={styles.modalStatLabel}>Tier</Text>
                    </View>
                  </View>

                  {unlockedIds.has(selectedAchievement.id) && (
                    <View style={styles.unlockedBanner}>
                      <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
                      <Text style={styles.unlockedText}>Unlocked!</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowUnlockModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  progressText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  achievementsList: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
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
  achievementCardUnlocked: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  badgeContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementNameLocked: {
    opacity: 0.6,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  checkmark: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
  },
  modalBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  modalStat: {
    alignItems: 'center',
    gap: 8,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unlockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  unlockedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
