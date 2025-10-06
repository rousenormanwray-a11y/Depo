import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

export interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        // Limit swipe distance
        const maxSwipe = SWIPE_THRESHOLD * 1.5;
        let newValue = gesture.dx;

        if (newValue > maxSwipe) newValue = maxSwipe;
        if (newValue < -maxSwipe) newValue = -maxSwipe;

        translateX.setValue(newValue);

        // Haptic feedback at threshold
        if (Math.abs(gesture.dx) >= SWIPE_THRESHOLD && Math.abs(gesture.dx) < SWIPE_THRESHOLD + 5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        translateX.flattenOffset();

        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swiped right
          if (rightAction || onSwipeRight) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            if (rightAction) rightAction.onPress();
            if (onSwipeRight) onSwipeRight();
          }
          resetPosition();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swiped left
          if (leftAction || onSwipeLeft) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            if (leftAction) leftAction.onPress();
            if (onSwipeLeft) onSwipeLeft();
          }
          resetPosition();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Left Action */}
      {leftAction && (
        <View style={[styles.actionContainer, styles.leftAction]}>
          <View style={[styles.actionContent, { backgroundColor: leftAction.color }]}>
            <Icon name={leftAction.icon} size={24} color={colors.white} />
            <Text style={styles.actionText}>{leftAction.label}</Text>
          </View>
        </View>
      )}

      {/* Right Action */}
      {rightAction && (
        <View style={[styles.actionContainer, styles.rightAction]}>
          <View style={[styles.actionContent, { backgroundColor: rightAction.color }]}>
            <Icon name={rightAction.icon} size={24} color={colors.white} />
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <Animated.View
        style={[
          styles.swipeableContent,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: SWIPE_THRESHOLD * 1.5,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  actionText: {
    ...typography.bodySmallBold,
    color: colors.white,
  },
  swipeableContent: {
    backgroundColor: colors.white,
  },
});

export default SwipeableRow;
