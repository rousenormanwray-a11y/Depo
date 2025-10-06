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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchActiveChallenges } from '../../store/slices/gamificationSlice';
import type { RootState, AppDispatch } from '../../store/store';
import type { WeeklyChallengeProgress } from '../../api/gamification';
import { colors } from '../../theme/colors';

export default function WeeklyChallengesScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { activeChallenges, challengesLoading } = useSelector(
    (state: RootState) => state.gamification
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    await dispatch(fetchActiveChallenges());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'donate':
        return 'gift';
      case 'coins':
        return 'coin';
      case 'referrals':
        return 'account-group';
      case 'streak':
        return 'fire';
      case 'perfect_days':
        return 'check-circle';
      default:
        return 'trophy';
    }
  };

  const renderChallengeCard = (challenge: WeeklyChallengeProgress) => {
    const percentage = Math.min(
      (challenge.currentValue / challenge.targetValue) * 100,
      100
    );
    const isCompleted = challenge.completed;
    const timeRemaining = getTimeRemaining(challenge.challenge.endDate);

    return (
      <TouchableOpacity
        key={challenge.id}
        style={[styles.challengeCard, isCompleted && styles.challengeCardComplete]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isCompleted ? ['#48BB78', '#38A169'] : [colors.primary, colors.primaryDark]}
          style={styles.challengeGradient}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getChallengeIcon(challenge.challenge.type) as any}
                size={32}
                color="#FFF"
              />
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.challengeName}>{challenge.challenge.name}</Text>
              <Text style={styles.challengeTime}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#FFF" />
                {'  '}
                {timeRemaining}
              </Text>
            </View>
          </View>

          <Text style={styles.challengeDescription}>
            {challenge.challenge.description}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {challenge.currentValue} / {challenge.targetValue}
              </Text>
              <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
          </View>

          <View style={styles.rewardSection}>
            <MaterialCommunityIcons name="coin" size={20} color="#FFD700" />
            <Text style={styles.rewardText}>
              {isCompleted ? 'Earned' : 'Reward'}: {challenge.challenge.rewardCoins} coins
            </Text>
            {isCompleted && (
              <View style={styles.completeBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (challengesLoading && activeChallenges.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  const completedChallenges = activeChallenges.filter((c) => c.completed);
  const activeChallengesFiltered = activeChallenges.filter((c) => !c.completed);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Weekly Challenges</Text>
        <Text style={styles.headerSubtitle}>Complete challenges for bonus rewards!</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeChallengesFiltered.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {completedChallenges.reduce((sum, c) => sum + c.challenge.rewardCoins, 0)}
            </Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Active Challenges */}
      {activeChallengesFiltered.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {activeChallengesFiltered.map(renderChallengeCard)}
        </View>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed This Week 🎉</Text>
          {completedChallenges.map(renderChallengeCard)}
        </View>
      )}

      {/* Empty State */}
      {activeChallenges.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="trophy-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Active Challenges</Text>
          <Text style={styles.emptyText}>
            Check back later for new weekly challenges!
          </Text>
        </View>
      )}

      {/* How It Works */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How It Works</Text>
        <Text style={styles.infoText}>
          • New challenges available every week{'\n'}
          • Complete challenges before time runs out{'\n'}
          • Earn bonus coins for each completed challenge{'\n'}
          • Challenges reset every Monday
        </Text>
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
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  challengeCardComplete: {
    borderWidth: 3,
    borderColor: colors.success,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerRight: {
    flex: 1,
    justifyContent: 'center',
  },
  challengeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  challengeTime: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  rewardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  completeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
