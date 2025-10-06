import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';

interface SkeletonPulseProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'pulse' | 'wave';
}

const SkeletonPulse: React.FC<SkeletonPulseProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'pulse',
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 'pulse' ? [0.3, 0.7] : [0.5, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[200],
  },
});

export default SkeletonPulse;
