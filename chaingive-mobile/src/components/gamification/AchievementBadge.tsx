import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number; // 0-1
  badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  shine?: boolean;
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  unlocked,
  progress = 0,
  badge,
  points,
  shine = false,
  onPress,
}) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shine && unlocked) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [shine, unlocked]);

  const getBadgeColors = (): [string, string] => {
    const colorMap = {
      bronze: ['#CD7F32', '#8B4513'],
      silver: ['#C0C0C0', '#808080'],
      gold: ['#FFD700', '#FFA500'],
      platinum: ['#E5E4E2', '#A8A8A8'],
      diamond: ['#B9F2FF', '#00CED1'],
    };
    return colorMap[badge];
  };

  const [startColor, endColor] = getBadgeColors();

  const shineOpacity = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableOpacity
      style={[styles.container, !unlocked && styles.lockedContainer]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }
      }}
      disabled={!unlocked && !onPress}
    >
      <View style={styles.badgeContainer}>
        <LinearGradient
          colors={unlocked ? [startColor, endColor] : [colors.gray[300], colors.gray[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          {shine && unlocked && (
            <Animated.View
              style={[
                styles.shineOverlay,
                {
                  opacity: shineOpacity,
                },
              ]}
            />
          )}
          <Icon
            name={icon}
            size={32}
            color={unlocked ? colors.white : colors.gray[500]}
          />
        </LinearGradient>

        {!unlocked && (
          <View style={styles.lockOverlay}>
            <Icon name="lock" size={24} color={colors.gray[600]} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {!unlocked && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.pointsBadge}>
            <Icon name="star" size={12} color={colors.gold} />
            <Text style={styles.pointsText}>+{points} XP</Text>
          </View>
          {unlocked && (
            <View style={styles.unlockedBadge}>
              <Icon name="check-circle" size={14} color={colors.success} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  badgeContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  badge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.gold}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xxs,
  },
  pointsText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
  unlockedBadge: {
    marginLeft: spacing.sm,
  },
});

export default AchievementBadge;
