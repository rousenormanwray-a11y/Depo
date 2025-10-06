import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

interface Ring {
  label: string;
  progress: number;
  goal: number;
  color: string;
  icon: string;
  unit?: string;
}

interface ProgressRingsProps {
  giveProgress: number;
  giveGoal: number;
  earnProgress: number;
  earnGoal: number;
  engageProgress: number;
  engageGoal: number;
  allRingsClosed?: boolean;
  onPress?: () => void;
}

const ProgressRings: React.FC<ProgressRingsProps> = ({
  giveProgress,
  giveGoal,
  earnProgress,
  earnGoal,
  engageProgress,
  engageGoal,
  allRingsClosed = false,
  onPress,
}) => {
  const rings: Ring[] = [
    {
      label: 'Give',
      progress: giveProgress,
      goal: giveGoal,
      color: colors.error,
      icon: 'favorite',
      unit: 'donation',
    },
    {
      label: 'Earn',
      progress: earnProgress,
      goal: earnGoal,
      color: colors.warning,
      icon: 'monetization-on',
      unit: 'coins',
    },
    {
      label: 'Engage',
      progress: engageProgress,
      goal: engageGoal,
      color: colors.info,
      icon: 'touch-app',
      unit: 'action',
    },
  ];

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Progress</Text>
        {allRingsClosed && (
          <View style={styles.perfectBadge}>
            <Icon name="stars" size={16} color={colors.warning} />
            <Text style={styles.perfectText}>Perfect Day!</Text>
          </View>
        )}
      </View>

      <View style={styles.ringsContainer}>
        {rings.map((ring, index) => (
          <RingView
            key={ring.label}
            ring={ring}
            index={index}
          />
        ))}
      </View>

      {allRingsClosed && (
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationText}>
            🎉 All rings closed! Keep it up!
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// INDIVIDUAL RING COMPONENT
// ============================================

interface RingViewProps {
  ring: Ring;
  index: number;
}

const RingView: React.FC<RingViewProps> = ({ ring, index }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((ring.progress / ring.goal) * 100, 100);
  const isClosed = ring.progress >= ring.goal;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: percentage,
      useNativeDriver: false,
      delay: index * 150,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.ringContainer}>
      {/* Ring Circle */}
      <View style={styles.ringWrapper}>
        <View style={[styles.ringBg, { borderColor: ring.color + '20' }]}>
          <Animated.View
            style={[
              styles.ringProgress,
              {
                borderColor: ring.color,
                transform: [
                  {
                    rotate: animatedProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
          
          <View style={styles.ringCenter}>
            <Icon 
              name={ring.icon} 
              size={24} 
              color={isClosed ? ring.color : colors.textSecondary} 
            />
            {isClosed && (
              <View style={[styles.checkmark, { backgroundColor: ring.color }]}>
                <Icon name="check" size={12} color={colors.white} />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Ring Info */}
      <Text style={styles.ringLabel}>{ring.label}</Text>
      <Text style={[styles.ringStats, isClosed && { color: ring.color }]}>
        {ring.progress}/{ring.goal}
      </Text>
      {ring.unit && (
        <Text style={styles.ringUnit}>
          {ring.unit}{ring.goal > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  perfectText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  ringContainer: {
    alignItems: 'center',
  },
  ringWrapper: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  ringBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringProgress: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringCenter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ringStats: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ringUnit: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  celebrationBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
});

export default ProgressRings;
