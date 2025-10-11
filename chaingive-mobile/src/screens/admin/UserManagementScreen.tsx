import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PageTransition,
  CountUpAnimation,
  PulseRing,
} from '../../components/animations';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import { adminService } from '../../services';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tier: string;
  trustScore: number;
  isVerified: boolean;
  isAgent: boolean;
  totalDonations: number;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
}

const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const filter = route.params?.filter;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>(filter || 'all');

  useEffect(() => {
    loadUsers();
  }, [selectedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserManagement({
        status: selectedFilter !== 'all' ? selectedFilter : undefined,
        search: searchQuery || undefined,
      });
      setUsers(response.users);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserPress = (user: User) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('UserDetail', { userId: user.id });
  };

  const handleVerifyUser = async (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Verify User',
      'Approve this user\'s KYC verification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await adminService.verifyUserKYC(userId, true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'User verified successfully');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to verify user');
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item: user }: { item: User }) => {
    const needsVerification = selectedFilter === 'pending_kyc' || !user.isVerified;

    return (
      <TouchableOpacity
        style={[styles.userCard, needsVerification && styles.unverifiedCard]}
        onPress={() => handleUserPress(user)}
      >
        {needsVerification && (
          <PulseRing size={60} color={colors.warning}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
          </PulseRing>
        )}
        {!needsVerification && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}{user.lastName[0]}
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            {user.isVerified && (
              <Icon name="verified" size={16} color={colors.success} />
            )}
            {user.isAgent && (
              <EnhancedBadge
                value="Agent"
                color={colors.primary}
                size="small"
              />
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userStats}>
            <View style={styles.statChip}>
              <Icon name="star" size={14} color={colors.gold} />
              <Text style={styles.statText}>{user.trustScore}</Text>
            </View>
            <View style={styles.statChip}>
              <Icon name="favorite" size={14} color={colors.primary} />
              <Text style={styles.statText}>{user.totalDonations}</Text>
            </View>
            <View style={styles.statChip}>
              <Icon name="shield" size={14} color={colors.info} />
              <Text style={styles.statText}>{user.tier}</Text>
            </View>
          </View>
        </View>

        {needsVerification && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={(e) => {
              e.stopPropagation();
              handleVerifyUser(user.id);
            }}
          >
            <Icon name="check-circle" size={20} color={colors.success} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadUsers}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {[
            { key: 'all', label: 'All Users' },
            { key: 'pending_kyc', label: 'Pending KYC' },
            { key: 'active', label: 'Active' },
            { key: 'suspended', label: 'Suspended' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                selectedFilter === filterOption.key && styles.activeFilter,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filterOption.key);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filterOption.key && styles.activeFilterText,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User List */}
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Icon name="people-outline" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No Users Found</Text>
                <Text style={styles.emptyMessage}>
                  Try adjusting your filters or search query
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: layout.screenPadding,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  unverifiedCard: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  verifyButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default UserManagementScreen;
