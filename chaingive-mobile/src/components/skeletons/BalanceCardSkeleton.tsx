import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

const BalanceCardSkeleton: React.FC = () => {
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
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.shimmerContainer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
      
      <View style={styles.header}>
        <View style={styles.labelLine} />
      </View>
      
      <View style={styles.balanceContainer}>
        <View style={styles.balanceLine} />
      </View>
      
      <View style={styles.footer}>
        <View style={styles.smallLine} />
        <View style={styles.smallLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
  },
  header: {
    marginBottom: spacing.md,
  },
  labelLine: {
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    width: '40%',
  },
  balanceContainer: {
    marginBottom: spacing.lg,
  },
  balanceLine: {
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    width: '70%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallLine: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    width: '35%',
  },
});

export default BalanceCardSkeleton;
