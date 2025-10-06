import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  progress: number; // 0-100
}

const ProgressBar: React.FC<Props> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

export default ProgressBar;
