import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  icon?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 2000,
  icon = 'check-circle',
  actionLabel,
  onActionPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close
      if (autoClose && onClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, autoClose, autoCloseDuration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onActionPress) {
      onActionPress();
    }
    handleClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name={icon} size={48} color={colors.success} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {/* Action Button */}
          {actionLabel && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleActionPress}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}

          {/* Close Button */}
          {!autoClose && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="close" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: screenWidth - 60,
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.large,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
});

export default SuccessModal;
