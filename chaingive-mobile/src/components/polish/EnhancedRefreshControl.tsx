import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface EnhancedRefreshControlProps extends Omit<RefreshControlProps, 'onRefresh'> {
  onRefresh: () => Promise<void> | void;
  withHaptic?: boolean;
}

/**
 * Enhanced RefreshControl with haptic feedback and consistent styling
 */
export const EnhancedRefreshControl: React.FC<EnhancedRefreshControlProps> = ({
  onRefresh,
  withHaptic = true,
  ...props
}) => {
  const handleRefresh = async () => {
    if (withHaptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await onRefresh();
  };

  return (
    <RefreshControl
      onRefresh={handleRefresh}
      colors={[colors.primary, colors.secondary]}
      tintColor={colors.primary}
      title="Pull to refresh"
      titleColor={colors.gray[600]}
      progressViewOffset={-10}
      {...props}
    />
  );
};

export default EnhancedRefreshControl;
