import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VerificationRequest } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  request: VerificationRequest;
  onPress: (request: VerificationRequest) => void;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

const VerificationRequestCard: React.FC<Props> = ({
  request,
  onPress,
  onApprove,
  onReject,
}) => {
  const getStatusColor = () => {
    switch (request.status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.gray[400];
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'cancel';
      case 'pending':
        return 'schedule';
      default:
        return 'help';
    }
  };

  const getTierBadgeColor = () => {
    return request.type === 'tier3' ? colors.tertiary : colors.secondary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(request)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {request.documents.selfie ? (
              <Image
                source={{ uri: request.documents.selfie }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="person" size={24} color={colors.gray[400]} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userId}>User ID: {request.userId}</Text>
            <Text style={styles.requestDate}>
              {formatDate(request.createdAt)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: getTierBadgeColor() },
            ]}
          >
            <Text style={styles.tierText}>
              {request.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusBadge}>
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
              {request.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.documentsContainer}>
        <Text style={styles.documentsTitle}>Documents:</Text>
        <View style={styles.documentsList}>
          {request.documents.selfie && (
            <View style={styles.documentItem}>
              <Icon name="face" size={16} color={colors.success} />
              <Text style={styles.documentText}>Selfie</Text>
            </View>
          )}
          {request.documents.idCard && (
            <View style={styles.documentItem}>
              <Icon name="credit-card" size={16} color={colors.success} />
              <Text style={styles.documentText}>ID Card</Text>
            </View>
          )}
          {request.documents.utilityBill && (
            <View style={styles.documentItem}>
              <Icon name="receipt" size={16} color={colors.success} />
              <Text style={styles.documentText}>Utility Bill</Text>
            </View>
          )}
        </View>
      </View>

      {request.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      )}

      {request.status === 'pending' && (onApprove || onReject) && (
        <View style={styles.actionsContainer}>
          {onReject && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(request.id)}
            >
              <Icon name="close" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
          {onApprove && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(request.id)}
            >
              <Icon name="check" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.chevron}>
        <Icon name="chevron-right" size={20} color={colors.gray[400]} />
      </View>
    </TouchableOpacity>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    flex: 1,
  },
  userId: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
  },
  requestDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  tierText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  documentsContainer: {
    marginBottom: spacing.sm,
  },
  documentsTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  documentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  documentText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  notesContainer: {
    marginBottom: spacing.sm,
  },
  notesTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  chevron: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});

export default VerificationRequestCard;