import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak?: number;
  streakLevel?: string;
  compact?: boolean;
  onPress?: () => void;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({
  currentStreak,
  longestStreak,
  streakLevel = 'bronze',
  compact = false,
  onPress,
}) => {
  const getStreakColor = () => {
    if (currentStreak === 0) return colors.textSecondary;
    if (currentStreak < 7) return colors.warning; // Bronze
    if (currentStreak < 30) return colors.info; // Silver
    if (currentStreak < 90) return colors.primary; // Gold
    return '#E5E4E2'; // Platinum
  };

  const getStreakIcon = () => {
    if (currentStreak === 0) return 'whatshot';
    if (currentStreak < 7) return 'local-fire-department';
    if (currentStreak < 30) return 'local-fire-department';
    if (currentStreak < 90) return 'whatshot';
    return 'stars';
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Start your streak!';
    if (currentStreak === 1) return 'Day 1! Keep going!';
    if (currentStreak < 7) return `${currentStreak} day streak! 🔥`;
    if (currentStreak < 30) return `${currentStreak} days strong! 💪`;
    if (currentStreak < 90) return `${currentStreak} days! Legend! 🏆`;
    return `${currentStreak} days! Unstoppable! 👑`;
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={[styles.compactIconWrapper, { backgroundColor: getStreakColor() + '20' }]}>
          <Icon name={getStreakIcon()} size={20} color={getStreakColor()} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactNumber}>{currentStreak}</Text>
          <Text style={styles.compactLabel}>day streak</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.fireIcon, { backgroundColor: getStreakColor() + '20' }]}>
          <Icon name={getStreakIcon()} size={32} color={getStreakColor()} />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Login Streak</Text>
          <Text style={[styles.message, { color: getStreakColor() }]}>
            {getStreakMessage()}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>

        {longestStreak !== undefined && (
          <>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.statBox}>
          <View style={[styles.levelBadge, { backgroundColor: getStreakColor() + '20' }]}>
            <Icon name="emoji-events" size={16} color={getStreakColor()} />
          </View>
          <Text style={[styles.statLabel, { color: getStreakColor(), textTransform: 'capitalize' }]}>
            {streakLevel}
          </Text>
        </View>
      </View>

      {currentStreak > 0 && (
        <View style={styles.motivationBar}>
          <Icon name="tips-and-updates" size={16} color={colors.info} />
          <Text style={styles.motivationText}>
            {currentStreak < 7
              ? `${7 - currentStreak} more days to Week Warrior!`
              : currentStreak < 30
              ? `${30 - currentStreak} more days to Month Master!`
              : currentStreak < 90
              ? `${90 - currentStreak} more days to Streak Legend!`
              : "You're a legend! Keep it up! 🚀"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fireIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  motivationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  motivationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.info,
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  compactLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default StreakWidget;
