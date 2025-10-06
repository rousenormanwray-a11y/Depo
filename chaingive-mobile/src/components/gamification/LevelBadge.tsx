import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'medium',
  showIcon = true,
}) => {
  const getLevelColor = (lvl: number): [string, string] => {
    if (lvl >= 50) return ['#FFD700', '#FFA500']; // Gold
    if (lvl >= 30) return ['#C0C0C0', '#808080']; // Silver
    if (lvl >= 10) return ['#CD7F32', '#8B4513']; // Bronze
    return [colors.primary, colors.secondary]; // Default
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { container: 50, icon: 16, text: 14 },
      medium: { container: 60, icon: 20, text: 16 },
      large: { container: 80, icon: 24, text: 20 },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();
  const [startColor, endColor] = getLevelColor(level);

  return (
    <LinearGradient
      colors={[startColor, endColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        {
          width: sizeStyles.container,
          height: sizeStyles.container,
          borderRadius: sizeStyles.container / 2,
        },
      ]}
    >
      {showIcon && (
        <Icon
          name="star"
          size={sizeStyles.icon}
          color={colors.white}
          style={styles.icon}
        />
      )}
      <Text style={[styles.levelText, { fontSize: sizeStyles.text }]}>
        {level}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  levelText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '800',
  },
});

export default LevelBadge;
