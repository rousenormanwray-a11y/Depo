import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AchievementUnlockAnimationProps {
  visible: boolean;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  onComplete?: () => void;
}

const AchievementUnlockAnimation: React.FC<AchievementUnlockAnimationProps> = ({
  visible,
  achievementName,
  achievementDescription,
  achievementIcon,
  badge,
  points,
  onComplete,
}) => {
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);

      // Haptic celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Slide in from top
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }).start();

      // Badge pop
      setTimeout(() => {
        Animated.spring(badgeScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        confettiRef.current?.start();
      }, 500);

      // Shine effect
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shineAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(shineAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 1000);

      // Auto-dismiss
      setTimeout(() => {
        handleComplete();
      }, 4000);
    } else {
      slideAnim.setValue(-screenHeight);
      badgeScaleAnim.setValue(0);
      shineAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenHeight,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScaleAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(false);
      if (onComplete) {
        onComplete();
      }
    });
  };

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
    outputRange: [0, 0.5],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            ref={confettiRef}
            count={150}
            origin={{ x: screenWidth / 2, y: screenHeight / 3 }}
            autoStart={false}
            fadeOut={true}
            fallSpeed={2500}
            colors={[startColor, endColor, colors.gold, colors.success]}
          />
        )}

        {/* Achievement Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[`${startColor}20`, `${endColor}20`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <Icon name="emoji-events" size={24} color={colors.gold} />
              <Text style={styles.headerText}>Achievement Unlocked!</Text>
            </View>

            {/* Badge */}
            <Animated.View
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: badgeScaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[startColor, endColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badge}
              >
                {/* Shine effect */}
                <Animated.View
                  style={[
                    styles.shine,
                    {
                      opacity: shineOpacity,
                    },
                  ]}
                />

                <Icon name={achievementIcon} size={48} color={colors.white} />
              </LinearGradient>
            </Animated.View>

            {/* Details */}
            <View style={styles.details}>
              <Text style={styles.name}>{achievementName}</Text>
              <Text style={styles.description}>{achievementDescription}</Text>

              {/* Points */}
              <View style={styles.pointsContainer}>
                <Icon name="star" size={20} color={colors.gold} />
                <Text style={styles.points}>+{points} XP</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  card: {
    width: screenWidth * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerText: {
    ...typography.h3,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  details: {
    alignItems: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.gold}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  points: {
    ...typography.bodyBold,
    color: colors.gold,
    marginLeft: spacing.xs,
  },
});

export default AchievementUnlockAnimation;
