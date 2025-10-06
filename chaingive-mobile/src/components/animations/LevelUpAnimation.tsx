import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import ParticleEffect from './ParticleEffect';

const { width: screenWidth } = Dimensions.get('window');

interface LevelUpAnimationProps {
  visible: boolean;
  newLevel: number;
  onComplete?: () => void;
  rewards?: string[];
}

const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  visible,
  newLevel,
  onComplete,
  rewards = [],
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowParticles(true);

      // Haptic sequence
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 400);

      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale and rotate badge
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        handleComplete();
      }, 3500);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      setShowParticles(false);
    }
  }, [visible]);

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowParticles(false);
      if (onComplete) {
        onComplete();
      }
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getLevelColor = (): [string, string] => {
    if (newLevel >= 50) return ['#FFD700', '#FFA500']; // Gold
    if (newLevel >= 30) return ['#C0C0C0', '#808080']; // Silver
    if (newLevel >= 10) return ['#CD7F32', '#8B4513']; // Bronze
    return [colors.primary, colors.secondary]; // Default
  };

  const [startColor, endColor] = getLevelColor();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.85],
              }),
            },
          ]}
        />

        {/* Particles */}
        {showParticles && (
          <ParticleEffect
            count={50}
            colors={[startColor, endColor, colors.gold]}
            duration={2000}
            spread={250}
          />
        )}

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Level Badge */}
          <Animated.View
            style={{
              transform: [{ rotate: rotation }],
            }}
          >
            <LinearGradient
              colors={[startColor, endColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Icon name="star" size={40} color={colors.white} style={styles.star} />
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Level Up!</Text>
            <Text style={styles.subtitle}>You reached level {newLevel}</Text>

            {/* Rewards */}
            {rewards.length > 0 && (
              <View style={styles.rewardsContainer}>
                <Text style={styles.rewardsTitle}>Rewards Unlocked:</Text>
                {rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardItem}>
                    <Icon name="check-circle" size={16} color={colors.success} />
                    <Text style={styles.rewardText}>{reward}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  content: {
    alignItems: 'center',
  },
  badge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  star: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  levelNumber: {
    ...typography.h1,
    fontSize: 48,
    color: colors.white,
    fontWeight: '800',
  },
  messageContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    maxWidth: screenWidth * 0.8,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  rewardsContainer: {
    marginTop: spacing.md,
    width: '100%',
  },
  rewardsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  rewardText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});

export default LevelUpAnimation;
