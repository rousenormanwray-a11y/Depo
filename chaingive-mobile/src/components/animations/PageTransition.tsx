import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransform = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: animatedValue,
        };

      case 'slide':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };

      case 'slideUp':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };

      case 'slideDown':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };

      case 'scale':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        };

      default:
        return { opacity: animatedValue };
    }
  };

  return (
    <Animated.View style={[getTransform(), style]}>
      {children}
    </Animated.View>
  );
};

export default PageTransition;
