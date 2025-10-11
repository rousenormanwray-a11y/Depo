import React, { useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
  swipeThreshold?: number;
}

/**
 * Swipeable card with gesture support and haptic feedback
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
  swipeThreshold = SWIPE_THRESHOLD,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > swipeThreshold && onSwipeRight) {
          // Swipe right
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: screenWidth,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeRight();
            reset();
          });
        } else if (gestureState.dx < -swipeThreshold && onSwipeLeft) {
          // Swipe left
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Animated.parallel([
            Animated.timing(pan.x, {
              toValue: -screenWidth,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeLeft();
            reset();
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const reset = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: pan.x }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({});

export default SwipeableCard;
