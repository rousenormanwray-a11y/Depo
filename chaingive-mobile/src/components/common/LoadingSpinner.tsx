import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<Props> = ({
  visible,
  message = 'Loading...',
  size = 'large',
  color = colors.primary,
  overlay = true,
}) => {
  if (!visible) return null;

  const content = (
    <View style={[styles.container, !overlay && styles.inline]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={[styles.message, { color }]}>{message}</Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inline: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.lg,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    ...typography.bodyRegular,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default LoadingSpinner;