import React, { useEffect, useRef } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  style?: TextStyle | TextStyle[];
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  formatter = (val) => Math.round(val).toString(),
  style,
  easing = 'easeOut',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    // Reset to 0 when value changes
    animatedValue.setValue(0);

    const easingMap = {
      linear: Animated.Easing.linear,
      easeIn: Animated.Easing.ease,
      easeOut: Animated.Easing.out(Animated.Easing.ease),
      easeInOut: Animated.Easing.inOut(Animated.Easing.ease),
    };

    // Animate to new value
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: easingMap[easing],
      useNativeDriver: false, // Can't use native driver for value animation
    }).start();

    // Update display value as animation progresses
    const listenerId = animatedValue.addListener(({ value: currentValue }) => {
      setDisplayValue(formatter(currentValue));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, formatter, easing]);

  return <Text style={style}>{displayValue}</Text>;
};

export default AnimatedNumber;
