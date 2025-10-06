import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
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
}

export function MissionCardSkeleton() {
  return (
    <View style={styles.missionCard}>
      <View style={styles.missionLeft}>
        <SkeletonLoader width={56} height={56} borderRadius={28} />
      </View>
      <View style={styles.missionCenter}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function AchievementCardSkeleton() {
  return (
    <View style={styles.achievementCard}>
      <SkeletonLoader width={72} height={72} borderRadius={36} style={{ marginRight: 16 }} />
      <View style={{ flex: 1 }}>
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={100} height={20} borderRadius={10} />
      </View>
    </View>
  );
}

export function ChallengeCardSkeleton() {
  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <SkeletonLoader width={56} height={56} borderRadius={28} style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="80%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="50%" height={14} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={10} borderRadius={5} style={{ marginTop: 16 }} />
      <View style={styles.challengeFooter}>
        <SkeletonLoader width={100} height={14} />
        <SkeletonLoader width={120} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  missionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  missionLeft: {
    marginRight: 16,
  },
  missionCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengeCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
