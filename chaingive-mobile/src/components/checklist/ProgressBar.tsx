import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  progress: number; // 0-100
  currentStep: number;
  totalSteps: number;
  animated?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const progressBarWidth = screenWidth - (spacing.md * 2);

const ProgressBar: React.FC<Props> = ({
  progress,
  currentStep,
  totalSteps,
  animated = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (animated) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Animate scale
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      progressAnim.setValue(progress);
      scaleAnim.setValue(1);
    }
  }, [progress, animated]);

  const getProgressColor = () => {
    if (progress >= 90) return colors.success;
    if (progress >= 70) return colors.primary;
    if (progress >= 40) return colors.warning;
    return colors.error;
  };

  const getProgressText = () => {
    if (progress === 100) return 'Completed! 🎉';
    if (progress >= 80) return 'Almost there! 💪';
    if (progress >= 50) return 'Great progress! 🚀';
    if (progress >= 25) return 'Getting started! 👍';
    return 'Let\'s begin! ✨';
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      </View>
      
      <Text style={styles.subtitle}>{getProgressText()}</Text>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { width: progressBarWidth }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, progressBarWidth],
                  extrapolate: 'clamp',
                }),
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>
      
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <View style={styles.stepsIndicator}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index < currentStep - 1 && styles.completedDot,
                index === currentStep - 1 && styles.currentDot,
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  percentage: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginLeft: spacing.xs,
  },
  completedDot: {
    backgroundColor: colors.success,
  },
  currentDot: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ProgressBar;