import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface GridSkeletonProps {
  columns?: number;
  count?: number;
  children: React.ReactElement;
  style?: any;
}

const GridSkeleton: React.FC<GridSkeletonProps> = ({
  columns = 2,
  count = 6,
  children,
  style,
}) => {
  const cardWidth = (screenWidth - (spacing.md * (columns + 1))) / columns;
  
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.itemContainer,
            { width: cardWidth },
            (index + 1) % columns === 0 && styles.lastInRow,
          ]}
        >
          {React.cloneElement(children, { width: cardWidth })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  itemContainer: {
    marginBottom: spacing.md,
    marginRight: spacing.md,
  },
  lastInRow: {
    marginRight: 0,
  },
});

export default GridSkeleton;
