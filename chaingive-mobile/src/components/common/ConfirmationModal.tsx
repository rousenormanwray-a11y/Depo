import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<Props> = ({ visible, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel}>
            <Text style={[styles.btnText, styles.cancelText]}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.confirm]} onPress={onConfirm}>
            <Text style={[styles.btnText, styles.confirmText]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, width: '100%' },
  title: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm },
  message: { ...typography.bodyRegular, color: colors.text.secondary, marginBottom: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, marginLeft: spacing.xs },
  cancel: { backgroundColor: colors.gray[100] },
  confirm: { backgroundColor: colors.primary },
  btnText: { ...typography.button },
  cancelText: { color: colors.text.primary },
  confirmText: { color: colors.white },
});

export default ConfirmationModal;
