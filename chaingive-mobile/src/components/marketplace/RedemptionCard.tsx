import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Redemption, MarketplaceItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  redemption: Redemption;
  item?: MarketplaceItem;
  onPress?: (redemption: Redemption) => void;
  showActions?: boolean;
}

const RedemptionCard: React.FC<Props> = ({
  redemption,
  item,
  onPress,
  showActions = false,
}) => {
  const getStatusColor = () => {
    switch (redemption.status) {
      case 'completed':
        return colors.success;
      case 'processing':
        return colors.warning;
      case 'failed':
        return colors.error;
      case 'pending':
        return colors.info;
      default:
        return colors.gray[400];
    }
  };

  const getStatusIcon = () => {
    switch (redemption.status) {
      case 'completed':
        return 'check-circle';
      case 'processing':
        return 'schedule';
      case 'failed':
        return 'error';
      case 'pending':
        return 'hourglass-empty';
      default:
        return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress ? () => onPress(redemption) : undefined}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.itemInfo}>
          {item?.image && (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item?.name || `Item ID: ${redemption.itemId}`}
            </Text>
            <Text style={styles.redemptionId}>
              #{redemption.id.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.redemptionDate}>
              {formatDate(redemption.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Icon
              name={getStatusIcon()}
              size={16}
              color={getStatusColor()}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor() },
              ]}
            >
              {redemption.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{redemption.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Coins:</Text>
          <Text style={styles.detailValue}>{redemption.totalCoins} CC</Text>
        </View>
        
        {redemption.voucherCode && (
          <View style={styles.voucherContainer}>
            <Text style={styles.voucherLabel}>Voucher Code:</Text>
            <View style={styles.voucherCode}>
              <Text style={styles.voucherText}>{redemption.voucherCode}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Icon name="content-copy" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {redemption.deliveryInfo && (
          <View style={styles.deliveryContainer}>
            <Text style={styles.deliveryLabel}>Delivery Info:</Text>
            {redemption.deliveryInfo.phoneNumber && (
              <Text style={styles.deliveryText}>
                📱 {redemption.deliveryInfo.phoneNumber}
              </Text>
            )}
            {redemption.deliveryInfo.email && (
              <Text style={styles.deliveryText}>
                📧 {redemption.deliveryInfo.email}
              </Text>
            )}
            {redemption.deliveryInfo.address && (
              <Text style={styles.deliveryText}>
                📍 {redemption.deliveryInfo.address}
              </Text>
            )}
          </View>
        )}
      </View>

      {showActions && redemption.status === 'processing' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Track Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
            <Icon name="support-agent" size={16} color={colors.text.secondary} />
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {onPress && (
        <View style={styles.chevron}>
          <Icon name="chevron-right" size={20} color={colors.gray[400]} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  redemptionId: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  redemptionDate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  voucherContainer: {
    marginTop: spacing.sm,
  },
  voucherLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  voucherCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  voucherText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontFamily: 'monospace',
    flex: 1,
    fontWeight: '600',
  },
  copyButton: {
    padding: spacing.xs,
  },
  deliveryContainer: {
    marginTop: spacing.sm,
  },
  deliveryLabel: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deliveryText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    flex: 0.48,
    justifyContent: 'center',
  },
  secondaryAction: {
    backgroundColor: colors.gray[100],
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: colors.text.secondary,
  },
  chevron: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});

export default RedemptionCard;