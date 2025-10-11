import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: any;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  style,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: newValue }) => {
      displayValue.current = Math.round(newValue);
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  return (
    <Animated.Text style={[styles.text, style]}>
      {prefix}
      {animatedValue.interpolate({
        inputRange: [0, value || 1],
        outputRange: ['0', String(value)],
      })}
      {suffix}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
