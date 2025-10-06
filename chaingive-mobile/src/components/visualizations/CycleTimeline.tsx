import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  status: 'pending' | 'matched' | 'confirmed' | 'completed' | 'defaulted';
  dueDate?: string;
}

const steps: Array<{ key: Props['status']; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'matched', label: 'Matched' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
];

const CycleTimeline: React.FC<Props> = ({ status, dueDate }) => {
  const activeIndex = steps.findIndex((s) => s.key === (status === 'defaulted' ? 'pending' : status));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {steps.map((s, idx) => {
          const active = idx <= activeIndex;
          return (
            <React.Fragment key={s.key}>
              <View style={[styles.dot, active ? styles.dotActive : styles.dotInactive]} />
              {idx < steps.length - 1 && (
                <View style={[styles.bar, active && idx < activeIndex ? styles.barActive : styles.barInactive]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.labels}>
        {steps.map((s) => (
          <Text key={s.key} style={styles.label}>{s.label}</Text>
        ))}
      </View>
      {dueDate && (
        <Text style={styles.due}>Due: {dueDate}</Text>
      )}
    </View>
  );
};

const DOT = 12;

const styles = StyleSheet.create({
  container: { marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.gray[300] },
  bar: { flex: 1, height: 4, marginHorizontal: spacing.xs, borderRadius: 2 },
  barActive: { backgroundColor: colors.primary },
  barInactive: { backgroundColor: colors.gray[200] },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  label: { ...typography.caption, color: colors.text.secondary },
  due: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.sm },
});

export default CycleTimeline;
