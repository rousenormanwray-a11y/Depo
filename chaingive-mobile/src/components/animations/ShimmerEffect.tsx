import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';

interface ShimmerEffectProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  duration?: number;
  colors?: string[];
  style?: ViewStyle;
}

const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = '100%',
  height = 100,
  borderRadius = 8,
  duration = 1500,
  colors: shimmerColors = [
    colors.gray[200],
    colors.gray[100],
    colors.gray[200],
  ],
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: shimmerColors[0],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '300%',
    height: '100%',
  },
});

export default ShimmerEffect;
