import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';

interface Heart {
  id: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface FloatingHeartsProps {
  count?: number;
  duration?: number;
  startX?: number;
  startY?: number;
  color?: string;
}

const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  count = 10,
  duration = 2000,
  startX = 0,
  startY = 0,
  color = colors.error,
}) => {
  const hearts = useRef<Heart[]>([]);

  useEffect(() => {
    // Create hearts with staggered start
    hearts.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }));

    // Animate each heart with delay
    hearts.current.forEach((heart, index) => {
      setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 100;

        Animated.parallel([
          Animated.timing(heart.translateY, {
            toValue: -200,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(heart.translateX, {
            toValue: randomX,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(heart.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(heart.opacity, {
              toValue: 0,
              duration: duration - 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.spring(heart.scale, {
              toValue: 1,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.timing(heart.scale, {
              toValue: 0.5,
              duration: duration - 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, index * 100);
    });
  }, []);

  return (
    <View style={[styles.container, { left: startX, top: startY }]} pointerEvents="none">
      {hearts.current.map((heart) => (
        <Animated.View
          key={heart.id}
          style={[
            styles.heartContainer,
            {
              opacity: heart.opacity,
              transform: [
                { translateY: heart.translateY },
                { translateX: heart.translateX },
                { scale: heart.scale },
              ],
            },
          ]}
        >
          <Icon name="favorite" size={24} color={color} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  heartContainer: {
    position: 'absolute',
  },
});

export default FloatingHearts;
