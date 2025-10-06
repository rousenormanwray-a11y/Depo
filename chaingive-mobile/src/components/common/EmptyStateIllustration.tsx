import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface EmptyStateIllustrationProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  gradientColors?: string[];
}

export default function EmptyStateIllustration({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  gradientColors = [colors.primary, colors.primaryDark],
}: EmptyStateIllustrationProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={styles.iconGradient}>
        <View style={styles.iconInner}>
          <MaterialCommunityIcons name={icon as any} size={80} color={colors.primary} />
        </View>
      </LinearGradient>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {onAction && actionLabel && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <LinearGradient colors={gradientColors} style={styles.buttonGradient}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Preset empty states for common scenarios
export function NoMissionsEmpty({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyStateIllustration
      icon="target"
      title="No Missions Today"
      description="Check back tomorrow for new daily missions and rewards!"
      actionLabel={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
    />
  );
}

export function NoChallengesEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyStateIllustration
      icon="trophy-outline"
      title="No Active Challenges"
      description="Weekly challenges will appear here. Check back soon!"
      actionLabel={onCreate ? "Create Challenge" : undefined}
      onAction={onCreate}
      gradientColors={['#FFD700', '#FFA500']}
    />
  );
}

export function NoAchievementsEmpty({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyStateIllustration
      icon="medal-outline"
      title="No Achievements Yet"
      description="Complete actions to unlock achievements and earn rewards!"
      actionLabel={onExplore ? "Explore" : undefined}
      onAction={onExplore}
      gradientColors={['#9F7AEA', '#805AD5']}
    />
  );
}

export function NoDataEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyStateIllustration
      icon="database-off-outline"
      title="No Data Available"
      description="We couldn't find any data. Try refreshing or check your connection."
      actionLabel="Retry"
      onAction={onRetry}
      gradientColors={['#718096', '#4A5568']}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
