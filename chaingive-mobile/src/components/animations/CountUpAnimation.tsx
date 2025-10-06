import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CountUpAnimationProps {
  from?: number;
  to: number;
  duration?: number;
  formatter?: (value: number) => string;
  style?: TextStyle;
  onComplete?: () => void;
  hapticOnComplete?: boolean;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
}

const CountUpAnimation: React.FC<CountUpAnimationProps> = ({
  from = 0,
  to,
  duration = 1500,
  formatter = (val) => Math.round(val).toString(),
  style,
  onComplete,
  hapticOnComplete = true,
  easing = 'easeOut',
}) => {
  const [displayValue, setDisplayValue] = useState(formatter(from));
  const animatedValue = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(formatter(value));
    });

    const easingFunction = {
      linear: undefined,
      easeIn: Animated.timing,
      easeOut: Animated.timing,
      easeInOut: Animated.timing,
      bounce: Animated.spring,
    }[easing];

    let animation;

    if (easing === 'bounce') {
      animation = Animated.spring(animatedValue, {
        toValue: to,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      });
    } else {
      animation = Animated.timing(animatedValue, {
        toValue: to,
        duration,
        useNativeDriver: false,
      });
    }

    animation.start(() => {
      if (hapticOnComplete) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (onComplete) {
        onComplete();
      }
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [to]);

  return <Text style={style}>{displayValue}</Text>;
};

export default CountUpAnimation;
