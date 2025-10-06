import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import EnhancedButton from './EnhancedButton';

interface EnhancedEmptyStateProps {
  icon?: string;
  lottieSource?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionPress?: () => void;
  style?: ViewStyle;
}

const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  icon,
  lottieSource,
  title,
  description,
  actionLabel,
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {lottieSource ? (
          <LottieView
            source={lottieSource}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : icon ? (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={80} color={colors.gray[400]} />
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onActionPress && (
            <EnhancedButton
              label={actionLabel}
              onPress={onActionPress}
              variant="primary"
              size="large"
              fullWidth
              style={styles.actionButton}
            />
          )}
          {secondaryActionLabel && onSecondaryActionPress && (
            <EnhancedButton
              label={secondaryActionLabel}
              onPress={onSecondaryActionPress}
              variant="outline"
              size="medium"
              fullWidth
              style={styles.secondaryActionButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  illustrationContainer: {
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.gray[400]}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: 0,
  },
  secondaryActionButton: {
    marginTop: 0,
  },
});

export default EnhancedEmptyState;
