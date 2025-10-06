import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { confirmReceipt } from '../../store/slices/donationSlice';

const CycleDetailScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isProcessing } = useSelector((s: RootState) => s.donation);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ visible: false, message: '' });

  const handleConfirmReceipt = async () => {
    setShowConfirm(false);
    try {
      await dispatch(confirmReceipt({ transactionId: 'mock-txn', confirm: true })).unwrap();
      setToast({ visible: true, message: 'Receipt confirmed. Cycle completed!', type: 'success' });
    } catch (e: any) {
      setToast({ visible: true, message: e.message || 'Failed to confirm receipt', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cycle Detail</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.hint}>Cycle timeline, due date, and confirm receipt flow.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowConfirm(true)} disabled={isProcessing}>
          <Text style={styles.primaryBtnText}>{isProcessing ? 'Processing…' : 'Confirm Receipt'}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={showConfirm}
        title="Confirm Receipt"
        message="Have you received the full donation amount?"
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirmReceipt}
        onCancel={() => setShowConfirm(false)}
      />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ visible: false, message: '' })} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: layout.screenPadding },
  hint: { ...typography.bodyRegular, color: colors.text.secondary, marginBottom: spacing.lg },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: spacing.md, alignItems: 'center', alignSelf: 'flex-start' },
  primaryBtnText: { ...typography.button, color: colors.white },
});

export default CycleDetailScreen;
