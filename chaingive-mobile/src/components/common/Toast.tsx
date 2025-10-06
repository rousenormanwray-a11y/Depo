import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
}

const bgByType = {
  success: '#28A745',
  error: '#DC3545',
  info: '#17A2B8',
} as const;

const Toast: React.FC<Props> = ({ visible, message, type = 'info', onHide }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: 50, duration: 150, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
          ]).start(onHide);
        }, 2000);
      });
    }
  }, [visible, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgByType[type], opacity, transform: [{ translateY }] } as ViewStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 12,
    padding: spacing.md,
  },
  text: { ...typography.bodyRegular, color: colors.white, textAlign: 'center' },
});

export default Toast;
