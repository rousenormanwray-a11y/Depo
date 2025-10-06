import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface StreakFlameProps {
  days: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  animate?: boolean;
}

const StreakFlame: React.FC<StreakFlameProps> = ({
  days,
  size = 'medium',
  showNumber = true,
  animate = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate && days > 0) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [days, animate]);

  const getSizeConfig = () => {
    const configs = {
      small: { icon: 32, container: 60, number: 12 },
      medium: { icon: 48, container: 80, number: 16 },
      large: { icon: 64, container: 100, number: 20 },
    };
    return configs[size];
  };

  const sizeConfig = getSizeConfig();

  const getFlameColor = () => {
    if (days >= 30) return ['#FF6B00', '#FFD700']; // Gold flame
    if (days >= 7) return ['#FF4500', '#FF8C00']; // Orange flame
    return ['#FF0000', '#FF6347']; // Red flame
  };

  const [startColor, endColor] = getFlameColor();

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  if (days === 0) {
    return (
      <View style={[styles.container, { width: sizeConfig.container, height: sizeConfig.container }]}>
        <Icon name="whatshot" size={sizeConfig.icon} color={colors.gray[400]} />
        {showNumber && (
          <View style={styles.numberBadge}>
            <Text style={[styles.number, { fontSize: sizeConfig.number }]}>0</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: sizeConfig.container, height: sizeConfig.container }]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            opacity: glowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[startColor, endColor]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Flame icon */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <LinearGradient
          colors={[startColor, endColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.flameGradient}
        >
          <Icon name="whatshot" size={sizeConfig.icon} color={colors.white} />
        </LinearGradient>
      </Animated.View>

      {/* Day count */}
      {showNumber && (
        <View style={styles.numberBadge}>
          <Text style={[styles.number, { fontSize: sizeConfig.number }]}>{days}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    opacity: 0.5,
  },
  flameGradient: {
    borderRadius: 50,
    padding: spacing.xs,
  },
  numberBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.white,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  number: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

export default StreakFlame;
