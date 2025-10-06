import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, Animated, Dimensions, Text } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConfettiCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
  message?: string;
  submessage?: string;
  duration?: number;
  confettiCount?: number;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  visible,
  onComplete,
  message = '🎉 Awesome!',
  submessage,
  duration = 3000,
  confettiCount = 200,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Triple haptic for extra celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);

      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale in message
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Trigger confetti
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);

      // Auto-dismiss
      setTimeout(() => {
        handleComplete();
      }, duration);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(false);
      if (onComplete) {
        onComplete();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7],
              }),
            },
          ]}
        />

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            ref={confettiRef}
            count={confettiCount}
            origin={{ x: screenWidth / 2, y: -10 }}
            autoStart={false}
            fadeOut={true}
            fallSpeed={3000}
            colors={[
              colors.primary,
              colors.secondary,
              colors.gold,
              colors.success,
              colors.warning,
              colors.info,
            ]}
          />
        )}

        {/* Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message}>{message}</Text>
          {submessage && (
            <Text style={styles.submessage}>{submessage}</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  messageContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: screenWidth * 0.8,
  },
  message: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ConfettiCelebration;
