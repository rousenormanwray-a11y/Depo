import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';

interface PullToRefreshAnimationProps {
  progress: number; // 0-1
  refreshing: boolean;
}

const PullToRefreshAnimation: React.FC<PullToRefreshAnimationProps> = ({
  progress,
  refreshing,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Spinning animation
      scaleAnim.setValue(1);
      
      const spinning = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );

      spinning.start();

      return () => spinning.stop();
    } else {
      // Scale based on pull progress
      Animated.timing(scaleAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: true,
      }).start();

      rotateAnim.setValue(progress);
    }
  }, [refreshing, progress]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const opacity = scaleAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity,
            transform: [
              { rotate: rotation },
              { scale },
            ],
          },
        ]}
      >
        <Icon
          name={refreshing ? 'refresh' : 'arrow-downward'}
          size={24}
          color={colors.primary}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default PullToRefreshAnimation;
