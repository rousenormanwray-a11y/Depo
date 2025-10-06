import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const { width: screenWidth } = Dimensions.get('window');

interface FABAction {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface MorphingFABProps {
  mainIcon?: string;
  mainColor?: string;
  actions?: FABAction[];
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

const MorphingFAB: React.FC<MorphingFABProps> = ({
  mainIcon = 'add',
  mainColor = colors.primary,
  actions = [],
  position = 'bottom-right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const actionAnims = useRef(
    actions.map(() => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      // Rotate main button
      Animated.spring(rotateAnim, {
        toValue,
        friction: 5,
        useNativeDriver: true,
      }),
      // Expand/contract
      Animated.timing(expandAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      // Animate actions
      ...actionAnims.map((anim, index) =>
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: toValue * -(index + 1) * 70,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
          }),
          Animated.spring(anim.scale, {
            toValue,
            friction: 5,
            delay: index * 50,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action: FABAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleExpand();
    setTimeout(() => action.onPress(), 300);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const getPositionStyle = () => {
    const base = {
      position: 'absolute' as const,
      bottom: spacing.xl,
    };

    switch (position) {
      case 'bottom-right':
        return { ...base, right: spacing.md };
      case 'bottom-left':
        return { ...base, left: spacing.md };
      case 'bottom-center':
        return { ...base, left: (screenWidth - 60) / 2 };
      default:
        return { ...base, right: spacing.md };
    }
  };

  return (
    <View style={[styles.container, getPositionStyle()]}>
      {/* Backdrop */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleExpand}
        />
      )}

      {/* Action Buttons */}
      {actions.map((action, index) => (
        <Animated.View
          key={index}
          style={[
            styles.actionContainer,
            {
              opacity: actionAnims[index].opacity,
              transform: [
                { translateY: actionAnims[index].translateY },
                { scale: actionAnims[index].scale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={() => handleActionPress(action)}
          >
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: action.color },
            ]}
            onPress={() => handleActionPress(action)}
          >
            <Icon name={action.icon} size={24} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Main FAB */}
      <Animated.View
        style={[
          styles.fab,
          { backgroundColor: mainColor },
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fabTouchable}
          onPress={toggleExpand}
        >
          <Icon name={mainIcon} size={28} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    ...shadows.floating,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  labelContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
    ...shadows.small,
  },
  label: {
    ...typography.bodySmallBold,
    color: colors.text.primary,
  },
});

export default MorphingFAB;
