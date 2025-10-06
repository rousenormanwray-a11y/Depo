import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  streakLevel?: string;
  onPress?: () => void;
}

export default function StreakWidget({
  currentStreak,
  longestStreak,
  streakLevel = 'bronze',
  onPress,
}: StreakWidgetProps) {
  const getStreakColor = (level: string) => {
    switch (level) {
      case 'diamond':
        return ['#B9F2FF', '#89CFF0'];
      case 'platinum':
        return ['#E5E4E2', '#C0C0C0'];
      case 'gold':
        return ['#FFD700', '#FFA500'];
      case 'silver':
        return ['#C0C0C0', '#808080'];
      default:
        return ['#CD7F32', '#8B4513'];
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '💤';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 14) return '🔥🔥🔥';
    if (streak < 30) return '🚀';
    if (streak < 60) return '⭐';
    if (streak < 90) return '💎';
    return '👑';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak!';
    if (streak < 3) return 'Keep it going!';
    if (streak < 7) return "You're on fire!";
    if (streak < 14) return 'Amazing streak!';
    if (streak < 30) return 'Unstoppable!';
    if (streak < 60) return 'Legendary!';
    if (streak < 90) return 'Diamond level!';
    return 'Ultimate champion!';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={getStreakColor(streakLevel)} style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.emoji}>{getStreakEmoji(currentStreak)}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.statRow}>
            <MaterialCommunityIcons name="trophy-outline" size={16} color="#FFF" />
            <Text style={styles.statText}>Best: {longestStreak}</Text>
          </View>
          <Text style={styles.message}>{getStreakMessage(currentStreak)}</Text>
        </View>
        
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#FFF"
          style={styles.chevron}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function StreakCalendar({ lastSevenDays }: { lastSevenDays: boolean[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <View style={styles.calendarContainer}>
      {days.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View
            style={[
              styles.dayCircle,
              lastSevenDays[index] && styles.dayCircleActive,
            ]}
          >
            {lastSevenDays[index] && (
              <MaterialCommunityIcons name="check" size={16} color="#FFF" />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 48,
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  rightSection: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  chevron: {
    marginLeft: 8,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.success,
  },
});
