import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchChecklistItems,
  toggleChecklistItem,
  updateUserProgress,
  clearError,
} from '../../store/slices/checklistSlice';
import { ChecklistItem as ChecklistItemType } from '../../types';
import ChecklistItem from '../../components/checklist/ChecklistItem';
import ProgressBar from '../../components/checklist/ProgressBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const ChecklistScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items, userProgress, loading, error } = useSelector(
    (state: RootState) => state.checklist
  );

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      dispatch(fetchChecklistItems(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchChecklistItems(user.id));
      setRefreshing(false);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await dispatch(toggleChecklistItem({ itemId, completed })).unwrap();
      if (user) {
        await dispatch(updateUserProgress(user.id));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update checklist item');
    }
  };

  const handleItemPress = (item: ChecklistItemType) => {
    Alert.alert(
      item.title,
      `${item.description}\n\n${item.requiredFor ? `Required for: ${item.requiredFor}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: item.completed ? 'Mark as Pending' : 'Mark as Complete',
          onPress: () => handleToggleItem(item.id, !item.completed),
        },
      ]
    );
  };

  const getFilteredItems = () => {
    switch (filter) {
      case 'pending':
        return items.filter(item => !item.completed);
      case 'completed':
        return items.filter(item => item.completed);
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();

  const renderFilterButton = (
    filterType: 'all' | 'pending' | 'completed',
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === filterType && styles.activeFilterButtonText,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Icon name="fact-check" size={28} color={colors.primary} />
        <Text style={styles.title}>Setup Checklist</Text>
      </View>
      <Text style={styles.subtitle}>
        Complete these steps to unlock all ChainGive features
      </Text>
      
      {userProgress && (
        <ProgressBar
          progress={userProgress.completionPercentage}
          currentStep={userProgress.currentStep}
          totalSteps={userProgress.totalSteps}
        />
      )}

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', items.length)}
        {renderFilterButton('pending', 'Pending', items.filter(item => !item.completed).length)}
        {renderFilterButton('completed', 'Completed', items.filter(item => item.completed).length)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="check-circle" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No items found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {filter === 'completed' 
          ? 'You haven\'t completed any items yet'
          : filter === 'pending'
          ? 'All items are completed!'
          : 'No checklist items available'
        }
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: ChecklistItemType }) => (
    <ChecklistItem
      item={item}
      onToggle={handleToggleItem}
      onPress={handleItemPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activeFilterButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ChecklistScreen;