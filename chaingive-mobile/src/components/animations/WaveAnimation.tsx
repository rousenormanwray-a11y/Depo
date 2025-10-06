import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaveAnimationProps {
  height?: number;
  color?: string;
  duration?: number;
  amplitude?: number;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({
  height = 100,
  color = colors.primary,
  duration = 3000,
  amplitude = 20,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const createWavePath = (phase: number) => {
    const points = 50;
    let path = `M 0 ${height}`;

    for (let i = 0; i <= points; i++) {
      const x = (screenWidth / points) * i;
      const angle = ((i / points) * Math.PI * 2) + phase;
      const y = height + Math.sin(angle) * amplitude;
      path += ` L ${x} ${y}`;
    }

    path += ` L ${screenWidth} ${height * 2}`;
    path += ` L 0 ${height * 2}`;
    path += ' Z';

    return path;
  };

  return (
    <View style={[styles.container, { height: height * 2 }]}>
      <Svg width={screenWidth} height={height * 2}>
        <AnimatedPath
          d={createWavePath(0)}
          fill={`${color}30`}
        />
        <AnimatedPath
          d={createWavePath(Math.PI)}
          fill={`${color}50`}
        />
        <AnimatedPath
          d={createWavePath(Math.PI / 2)}
          fill={color}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    overflow: 'hidden',
  },
});

export default WaveAnimation;
