import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface BouncyButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  withHaptic?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  scaleValue?: number;
}

/**
 * Button with bouncy press animation and haptic feedback
 */
export const BouncyButton: React.FC<BouncyButtonProps> = ({
  children,
  onPress,
  withHaptic = true,
  hapticStyle = 'medium',
  scaleValue = 0.95,
  style,
  disabled,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    if (withHaptic) {
      const hapticType = 
        hapticStyle === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        hapticStyle === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
        Haptics.ImpactFeedbackStyle.Medium;
      
      Haptics.impactAsync(hapticType);
    }

    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={style}
      {...props}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    height: '100%',
  },
});

export default BouncyButton;
