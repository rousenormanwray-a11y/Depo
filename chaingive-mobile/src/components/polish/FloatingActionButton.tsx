import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface FloatingActionButtonProps {
  icon: string;
  label?: string;
  onPress: () => void;
  color?: string;
  size?: number;
}

/**
 * Floating action button with gradient, animation, and haptic feedback
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onPress,
  color = colors.primary,
  size = 56,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }, { rotate: rotation }],
          },
        ]}
      >
        <LinearGradient
          colors={[color, `${color}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: size / 2 }]}
        >
          <Icon name={icon} size={size * 0.5} color={colors.white} />
        </LinearGradient>
      </Animated.View>
      
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    ...shadows.large,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
});

export default FloatingActionButton;
