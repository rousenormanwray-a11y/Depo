import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import FloatingHearts from './FloatingHearts';
import CountUpAnimation from './CountUpAnimation';

const { width: screenWidth } = Dimensions.get('window');

interface DonationSuccessAnimationProps {
  amount: number;
  recipientName: string;
  onComplete?: () => void;
}

const DonationSuccessAnimation: React.FC<DonationSuccessAnimationProps> = ({
  amount,
  recipientName,
  onComplete,
}) => {
  const checkAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Check mark animation
    Animated.spring(checkAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Ring expand
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Content fade in
    setTimeout(() => {
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Auto-complete
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000);
  }, []);

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.3, 1],
  });

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 0],
  });

  return (
    <View style={styles.container}>
      {/* Floating hearts */}
      <FloatingHearts
        count={15}
        duration={2500}
        startX={screenWidth / 2}
        startY={200}
        color={colors.error}
      />

      {/* Success Icon */}
      <View style={styles.iconContainer}>
        {/* Expanding ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Check mark */}
        <Animated.View
          style={{
            transform: [{ scale: checkScale }],
          }}
        >
          <View style={styles.checkContainer}>
            <Icon name="favorite" size={60} color={colors.white} />
          </View>
        </Animated.View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.title}>Donation Sent! 🎉</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>₦</Text>
          <CountUpAnimation
            from={0}
            to={amount}
            duration={1500}
            formatter={(val) => val.toLocaleString('en-NG', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            style={styles.amount}
            easing="easeOut"
          />
        </View>

        <Text style={styles.recipient}>
          sent to <Text style={styles.recipientName}>{recipientName}</Text>
        </Text>

        <View style={styles.messageContainer}>
          <Icon name="volunteer-activism" size={20} color={colors.success} />
          <Text style={styles.message}>
            Your kindness makes a difference
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: colors.success,
  },
  checkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  currency: {
    ...typography.h2,
    color: colors.success,
    marginRight: spacing.xs,
  },
  amount: {
    ...typography.h1,
    fontSize: 42,
    fontWeight: '800',
    color: colors.success,
  },
  recipient: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  recipientName: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  message: {
    ...typography.bodySmall,
    color: colors.success,
    marginLeft: spacing.sm,
  },
});

export default DonationSuccessAnimation;
