import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

interface ListSkeletonProps {
  count?: number;
  children: React.ReactElement;
  style?: any;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          {React.cloneElement(children)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
});

export default ListSkeleton;
