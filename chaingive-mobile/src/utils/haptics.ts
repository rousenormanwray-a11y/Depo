import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities
 * Provides consistent haptic feedback throughout the app
 */

export const hapticFeedback = {
  /**
   * Light impact - for subtle interactions
   * Use for: selection changes, toggles, chip selections
   */
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium impact - for standard interactions
   * Use for: button presses, tab changes, card taps
   */
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy impact - for important interactions
   * Use for: confirmation actions, deletions, important decisions
   */
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success notification - for successful actions
   * Use for: successful transactions, achievements unlocked, tasks completed
   */
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning notification - for warnings or cautions
   * Use for: low balance alerts, verification needed, pending actions
   */
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error notification - for errors or failures
   * Use for: failed transactions, validation errors, network errors
   */
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Selection - for scrolling through items
   * Use for: picker changes, slider adjustments, list scrolling
   */
  selection: () => {
    Haptics.selectionAsync();
  },
};

export default hapticFeedback;
