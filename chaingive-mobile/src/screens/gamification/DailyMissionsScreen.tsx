import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchTodaysMissions, completeMission, hideRewardAnimation } from '../../store/slices/gamificationSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { colors } from '../../theme/colors';

export default function DailyMissionsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { todaysMissions, missionsLoading, missionsError, recentCoinsEarned, showRewardAnimation } = useSelector(
    (state: RootState) => state.gamification
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => {
    if (showRewardAnimation) {
      setConfettiKey((prev) => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        dispatch(hideRewardAnimation());
      }, 3000);
    }
  }, [showRewardAnimation]);

  const loadMissions = async () => {
    await dispatch(fetchTodaysMissions());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMissions();
    setRefreshing(false);
  };

  const renderMissionCard = (
    title: string,
    description: string,
    reward: number,
    isDone: boolean,
    icon: string
  ) => {
    return (
      <View style={[styles.missionCard, isDone && styles.missionCardComplete]}>
        <View style={styles.missionLeft}>
          <View style={[styles.iconCircle, isDone && styles.iconCircleComplete]}>
            <MaterialCommunityIcons
              name={isDone ? 'check-circle' : (icon as any)}
              size={32}
              color={isDone ? colors.success : colors.primary}
            />
          </View>
        </View>
        
        <View style={styles.missionCenter}>
          <Text style={[styles.missionTitle, isDone && styles.missionTitleComplete]}>
            {title}
          </Text>
          <Text style={styles.missionDescription}>{description}</Text>
        </View>
        
        <View style={styles.missionRight}>
          <View style={[styles.rewardBadge, isDone && styles.rewardBadgeComplete]}>
            <MaterialCommunityIcons name="coin" size={16} color="#FFD700" />
            <Text style={styles.rewardText}>+{reward}</Text>
          </View>
        </View>
      </View>
    );
  };

  const missions = todaysMissions
    ? [
        {
          title: todaysMissions.mission1Name,
          description: todaysMissions.mission1Desc,
          reward: todaysMissions.mission1Reward,
          isDone: todaysMissions.mission1Done,
          icon: 'gift-outline',
        },
        {
          title: todaysMissions.mission2Name,
          description: todaysMissions.mission2Desc,
          reward: todaysMissions.mission2Reward,
          isDone: todaysMissions.mission2Done,
          icon: 'wallet-outline',
        },
        {
          title: todaysMissions.mission3Name,
          description: todaysMissions.mission3Desc,
          reward: todaysMissions.mission3Reward,
          isDone: todaysMissions.mission3Done,
          icon: 'share-variant-outline',
        },
      ]
    : [];

  const completedCount = missions.filter((m) => m.isDone).length;
  const totalRewards = missions.reduce((sum, m) => (m.isDone ? sum + m.reward : sum), 0);
  const potentialBonus = todaysMissions?.allCompleted ? todaysMissions.bonusReward : 0;

  if (missionsLoading && !todaysMissions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading today's missions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {showRewardAnimation && (
        <ConfettiCannon key={confettiKey} count={50} origin={{ x: -10, y: 0 }} fadeOut autoStart />
      )}

      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Daily Missions</Text>
        <Text style={styles.headerSubtitle}>Complete all 3 for a bonus!</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / 3) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/3 Complete
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="coin" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{totalRewards}</Text>
          <Text style={styles.statLabel}>Coins Earned</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{todaysMissions?.bonusReward || 0}</Text>
          <Text style={styles.statLabel}>Bonus Reward</Text>
        </View>
      </View>

      {/* Missions List */}
      <View style={styles.missionsContainer}>
        <Text style={styles.sectionTitle}>Today's Missions</Text>
        
        {missions.map((mission, index) => (
          <View key={index}>{renderMissionCard(mission.title, mission.description, mission.reward, mission.isDone, mission.icon)}</View>
        ))}
      </View>

      {/* All Complete Bonus */}
      {todaysMissions?.allCompleted && (
        <View style={styles.bonusCard}>
          <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.bonusGradient}>
            <MaterialCommunityIcons name="star-circle" size={48} color="#FFF" />
            <Text style={styles.bonusTitle}>🎉 All Missions Complete!</Text>
            <Text style={styles.bonusText}>You earned {todaysMissions.bonusReward} bonus coins!</Text>
          </LinearGradient>
        </View>
      )}

      {/* Next Steps */}
      {!todaysMissions?.allCompleted && (
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          {!todaysMissions?.mission1Done && (
            <Text style={styles.tipText}>• Make a donation to complete Mission 1</Text>
          )}
          {!todaysMissions?.mission2Done && (
            <Text style={styles.tipText}>• Buy 10+ coins to complete Mission 2</Text>
          )}
          {!todaysMissions?.mission3Done && (
            <Text style={styles.tipText}>• Share your referral code to complete Mission 3</Text>
          )}
        </View>
      )}

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
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  missionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  missionCard: {
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
  missionCardComplete: {
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
    borderColor: colors.success,
  },
  missionLeft: {
    marginRight: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleComplete: {
    backgroundColor: '#C6F6D5',
  },
  missionCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  missionTitleComplete: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  missionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  missionRight: {
    justifyContent: 'center',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rewardBadgeComplete: {
    opacity: 0.6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
  },
  bonusCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bonusGradient: {
    padding: 24,
    alignItems: 'center',
  },
  bonusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  tipsCard: {
    margin: 16,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
