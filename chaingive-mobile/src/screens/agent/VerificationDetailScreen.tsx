import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

interface RouteParams { requestId: string }

const VerificationDetailScreen: React.FC = () => {
  const route = useRoute();
  const { requestId } = route.params as RouteParams;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verification Detail</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Request ID</Text>
        <Text style={styles.value}>{requestId}</Text>
        <Text style={styles.hint}>Detailed information and approve/reject actions will be implemented.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { padding: layout.screenPadding },
  label: { ...typography.caption, color: colors.text.secondary },
  value: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xs },
  hint: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.md },
});

export default VerificationDetailScreen;
