import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchTodaysMissions, completeMission } from '../../store/slices/gamificationSlice';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

const DailyMissionsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { missions, missionsLoading } = useSelector((state: RootState) => state.gamification);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setRefreshing(true);
    await dispatch(fetchTodaysMissions());
    setRefreshing(false);
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadMissions();
  };

  if (missionsLoading && !missions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your daily missions...</Text>
      </View>
    );
  }

  if (!missions) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="assignment" size={80} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No missions available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMissions}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mission1Done = missions.mission1Done;
  const mission2Done = missions.mission2Done;
  const mission3Done = missions.mission3Done;
  const allCompleted = missions.allCompleted;

  const totalMissions = 3;
  const completedCount = [mission1Done, mission2Done, mission3Done].filter(Boolean).length;
  const progressPercentage = (completedCount / totalMissions) * 100;

  const potentialCoins = 
    (!mission1Done ? missions.mission1Reward : 0) +
    (!mission2Done ? missions.mission2Reward : 0) +
    (!mission3Done ? missions.mission3Reward : 0) +
    (completedCount === totalMissions - 1 && !allCompleted ? missions.bonusReward : 0);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Daily Missions</Text>
            <Text style={styles.headerSubtitle}>
              Complete all 3 for bonus rewards!
            </Text>
          </View>
          <View style={styles.coinsContainer}>
            <Icon name="monetization-on" size={24} color={colors.warning} />
            <Text style={styles.coinsText}>{missions.totalCoinsEarned}</Text>
            <Text style={styles.coinsLabel}>earned</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalMissions} missions complete
          </Text>
        </View>

        {!allCompleted && potentialCoins > 0 && (
          <View style={styles.potentialCoinsContainer}>
            <Icon name="stars" size={20} color={colors.warning} />
            <Text style={styles.potentialCoinsText}>
              {potentialCoins} more coins available today!
            </Text>
          </View>
        )}

        {allCompleted && (
          <View style={styles.completedBanner}>
            <Icon name="celebration" size={24} color={colors.success} />
            <Text style={styles.completedText}>
              🎉 All missions complete! +{missions.bonusReward} bonus coins!
            </Text>
          </View>
        )}
      </View>

      {/* Mission 1 */}
      <MissionCard
        title={missions.mission1Name}
        description={missions.mission1Desc}
        reward={missions.mission1Reward}
        completed={mission1Done}
        icon="favorite"
        color={colors.error}
      />

      {/* Mission 2 */}
      <MissionCard
        title={missions.mission2Name}
        description={missions.mission2Desc}
        reward={missions.mission2Reward}
        completed={mission2Done}
        icon="monetization-on"
        color={colors.warning}
      />

      {/* Mission 3 */}
      <MissionCard
        title={missions.mission3Name}
        description={missions.mission3Desc}
        reward={missions.mission3Reward}
        completed={mission3Done}
        icon="share"
        color={colors.info}
      />

      {/* Footer Tips */}
      <View style={styles.tipsCard}>
        <Icon name="lightbulb" size={24} color={colors.warning} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>💡 Daily Tips</Text>
          <Text style={styles.tipsText}>
            • New missions available every day at midnight{'\n'}
            • Complete all 3 for a special bonus{'\n'}
            • Weekend missions give 1.5x rewards!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================
// MISSION CARD COMPONENT
// ============================================

interface MissionCardProps {
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  icon: string;
  color: string;
}

const MissionCard: React.FC<MissionCardProps> = ({
  title,
  description,
  reward,
  completed,
  icon,
  color,
}) => {
  return (
    <View style={[styles.missionCard, completed && styles.missionCardCompleted]}>
      <View style={[styles.missionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={32} color={color} />
      </View>
      
      <View style={styles.missionContent}>
        <View style={styles.missionHeader}>
          <Text style={[styles.missionTitle, completed && styles.missionTitleCompleted]}>
            {title}
          </Text>
          {completed && (
            <Icon name="check-circle" size={24} color={colors.success} />
          )}
        </View>
        
        <Text style={styles.missionDescription}>{description}</Text>
        
        <View style={styles.missionFooter}>
          <View style={styles.rewardBadge}>
            <Icon name="monetization-on" size={16} color={colors.warning} />
            <Text style={styles.rewardText}>{reward} coins</Text>
          </View>
          
          {completed && (
            <Text style={styles.completedLabel}>✓ Completed</Text>
          )}
        </View>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  coinsContainer: {
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
    marginTop: 4,
  },
  coinsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  potentialCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  potentialCoinsText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '10',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  completedText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionCardCompleted: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: colors.success + '30',
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  missionContent: {
    flex: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  missionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rewardText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  completedLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginTop: 8,
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
});

export default DailyMissionsScreen;
