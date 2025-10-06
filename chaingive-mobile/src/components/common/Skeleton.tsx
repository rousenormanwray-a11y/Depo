import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<Props> = ({ width = '100%', height = 16, style }) => {
  return <View style={[styles.skeleton, { width, height }, style]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
});

export default Skeleton;
