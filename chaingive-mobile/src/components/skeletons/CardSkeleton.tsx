import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardSkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  width = '100%',
  height = 120,
  style,
}) => {
  const shimmerValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-350, 350],
  });

  return (
    <View style={[styles.card, { width, height }, style]}>
      <Animated.View style={[styles.shimmerContainer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['#E1E1E1', '#F5F5F5', '#E1E1E1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.info}>
          <View style={styles.titleLine} />
          <View style={styles.subtitleLine} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.shortLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    flex: 1,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E1E1',
  },
  info: {
    marginLeft: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: spacing.xs,
    width: '60%',
  },
  subtitleLine: {
    height: 12,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    width: '40%',
  },
  content: {
    gap: spacing.xs,
  },
  line: {
    height: 12,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  shortLine: {
    height: 12,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    width: '70%',
  },
});

export default CardSkeleton;
