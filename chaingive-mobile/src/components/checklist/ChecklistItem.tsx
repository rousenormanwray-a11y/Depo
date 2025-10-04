import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ChecklistItem as ChecklistItemType } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  item: ChecklistItemType;
  onToggle: (itemId: string, completed: boolean) => void;
  onPress?: (item: ChecklistItemType) => void;
}

const ChecklistItem: React.FC<Props> = ({ item, onToggle, onPress }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress(item);
    }
  };

  const handleToggle = () => {
    onToggle(item.id, !item.completed);
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.gray[400];
    }
  };

  const getCategoryIcon = () => {
    switch (item.category) {
      case 'setup':
        return 'settings';
      case 'verification':
        return 'verified-user';
      case 'donation':
        return 'favorite';
      case 'marketplace':
        return 'store';
      default:
        return 'check-circle';
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[
          styles.itemContainer,
          item.completed && styles.completedContainer,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.completed && styles.checkedBox,
            ]}
            onPress={handleToggle}
          >
            {item.completed && (
              <Icon name="check" size={16} color={colors.white} />
            )}
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Icon
              name={getCategoryIcon()}
              size={20}
              color={item.completed ? colors.gray[400] : colors.primary}
            />
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                item.completed && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
          </View>
          
          <Text
            style={[
              styles.description,
              item.completed && styles.completedDescription,
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          
          {item.requiredFor && (
            <Text style={styles.requiredFor}>
              Required for: {item.requiredFor}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          <Icon
            name="chevron-right"
            size={20}
            color={colors.gray[400]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedContainer: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkedBox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  completedTitle: {
    color: colors.gray[500],
    textDecorationLine: 'line-through',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  completedDescription: {
    color: colors.gray[400],
  },
  requiredFor: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
  rightSection: {
    marginLeft: spacing.sm,
  },
});

export default ChecklistItem;