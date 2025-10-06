import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import { colors } from '../../theme/colors';

interface PulseRingProps {
  size?: number;
  color?: string;
  count?: number;
  duration?: number;
  delay?: number;
}

const PulseRing: React.FC<PulseRingProps> = ({
  size = 100,
  color = colors.primary,
  count = 3,
  duration = 2000,
  delay = 500,
}) => {
  const rings = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // Create animated values for each ring
    rings.current = Array.from({ length: count }, () => new Animated.Value(0));

    // Animate each ring with staggered delay
    const animations = rings.current.map((ring, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * delay),
          Animated.parallel([
            Animated.timing(ring, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(delay * (count - index - 1)),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {rings.current.map((ring, index) => (
        <Animated.View
          key={index}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: ring.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 0],
              }),
              transform: [
                {
                  scale: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
});

export default PulseRing;
