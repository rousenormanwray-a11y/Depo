import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface EnhancedBadgeProps {
  value: number | string;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outline' | 'dot';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  pulse?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  maxValue?: number;
}

const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  value,
  color = colors.error,
  textColor = colors.white,
  size = 'medium',
  variant = 'solid',
  position = 'top-right',
  pulse = false,
  style,
  textStyle,
  maxValue = 99,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [pulse]);

  const getSizeStyle = (): ViewStyle => {
    const sizes = {
      small: { minWidth: 16, height: 16, borderRadius: 8, padding: 2 },
      medium: { minWidth: 20, height: 20, borderRadius: 10, padding: 3 },
      large: { minWidth: 24, height: 24, borderRadius: 12, padding: 4 },
    };
    return sizes[size];
  };

  const getTextSizeStyle = (): TextStyle => {
    const sizes = {
      small: { fontSize: 10, lineHeight: 12 },
      medium: { fontSize: 11, lineHeight: 14 },
      large: { fontSize: 12, lineHeight: 16 },
    };
    return sizes[size];
  };

  const getPositionStyle = (): ViewStyle => {
    const positions = {
      'top-right': { position: 'absolute', top: -8, right: -8 },
      'top-left': { position: 'absolute', top: -8, left: -8 },
      'bottom-right': { position: 'absolute', bottom: -8, right: -8 },
      'bottom-left': { position: 'absolute', bottom: -8, left: -8 },
      'inline': {},
    };
    return positions[position] as ViewStyle;
  };

  const getVariantStyle = (): ViewStyle => {
    const variants = {
      solid: {
        backgroundColor: color,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: color,
      },
      dot: {
        backgroundColor: color,
        minWidth: getSizeStyle().height,
      },
    };
    return variants[variant];
  };

  const displayValue = typeof value === 'number' && value > maxValue
    ? `${maxValue}+`
    : value.toString();

  const badgeContent = variant === 'dot' ? null : (
    <Text
      style={[
        styles.text,
        getTextSizeStyle(),
        {
          color: variant === 'outline' ? color : textColor,
        },
        textStyle,
      ]}
    >
      {displayValue}
    </Text>
  );

  return (
    <Animated.View
      style={[
        styles.badge,
        getSizeStyle(),
        getPositionStyle(),
        getVariantStyle(),
        pulse && { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      {badgeContent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default EnhancedBadge;
