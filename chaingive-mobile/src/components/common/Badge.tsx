import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  text: string;
  variant?: 'active' | 'pending' | 'completed' | 'failed';
}

const Badge: React.FC<Props> = ({ text, variant = 'active' }) => {
  const stylesByVariant = {
    active: { backgroundColor: '#D4EDDA', color: '#155724' },
    pending: { backgroundColor: '#FFF3CD', color: '#856404' },
    completed: { backgroundColor: '#D4EDDA', color: '#155724' },
    failed: { backgroundColor: '#F8D7DA', color: '#721C24' },
  } as const;

  const v = stylesByVariant[variant];

  return (
    <View style={[styles.badge, { backgroundColor: v.backgroundColor }]}>
      <Text style={[styles.text, { color: v.color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '600' },
});

export default Badge;
