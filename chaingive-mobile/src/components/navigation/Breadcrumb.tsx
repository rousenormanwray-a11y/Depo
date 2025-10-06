import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BreadcrumbItem {
  label: string;
  key: string;
  onPress: () => void;
}

interface BreadcrumbProps {
  showHomeIcon?: boolean;
  maxItems?: number;
  customItems?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  showHomeIcon = true,
  maxItems = 4,
  customItems,
}) => {
  const navigation = useNavigation();
  const routes = useNavigationState((state) => state?.routes || []);

  const breadcrumbs: BreadcrumbItem[] = customItems || routes.slice(-maxItems).map((route, index) => ({
    label: formatRouteName(route.name),
    key: route.key,
    onPress: () => {
      if (index < routes.length - 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.goBack();
      }
    },
  }));

  const formatRouteName = (name: string): string => {
    // Convert route names to readable labels
    const nameMap: Record<string, string> = {
      'HomeScreen': 'Home',
      'TransactionHistory': 'Transactions',
      'GiveScreen': 'Give',
      'DepositScreen': 'Deposit',
      'WithdrawScreen': 'Withdraw',
      'MarketplaceScreen': 'Marketplace',
      'ItemDetail': 'Item Detail',
      'AgentDashboard': 'Agent',
      'ConfirmCoinPayment': 'Confirm Payment',
      'CycleDetail': 'Cycle',
      'Profile': 'Profile',
    };

    return nameMap[name] || name.replace(/([A-Z])/g, ' $1').trim();
  };

  if (breadcrumbs.length === 0) return null;

  return (
    <View style={styles.container}>
      {showHomeIcon && (
        <>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Home' as never);
            }}
            style={styles.item}
          >
            <Icon name="home" size={18} color={colors.primary} />
          </TouchableOpacity>
          {breadcrumbs.length > 0 && (
            <Icon name="chevron-right" size={16} color={colors.gray[400]} style={styles.separator} />
          )}
        </>
      )}

      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.key}>
          {index > 0 && (
            <Icon name="chevron-right" size={16} color={colors.gray[400]} style={styles.separator} />
          )}
          <TouchableOpacity
            onPress={crumb.onPress}
            style={styles.item}
            disabled={index === breadcrumbs.length - 1}
          >
            <Text
              style={[
                styles.label,
                index === breadcrumbs.length - 1 && styles.activeLabel,
              ]}
              numberOfLines={1}
            >
              {crumb.label}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  item: {
    paddingHorizontal: spacing.xs,
  },
  separator: {
    marginHorizontal: spacing.xxs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.gray[600],
  },
  activeLabel: {
    ...typography.bodySmallBold,
    color: colors.primary,
  },
});

export default Breadcrumb;
