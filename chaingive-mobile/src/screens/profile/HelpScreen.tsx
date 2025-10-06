import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const HelpScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Need Help?</Text>
        <Text style={styles.subtitle}>Find answers or contact our support team.</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@chaingive.ng')}>
          <Text style={styles.link}>Email: support@chaingive.ng</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/2340000000000')}>
          <Text style={styles.link}>WhatsApp: +234-000-000-0000</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, margin: layout.screenPadding },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.md },
  link: { ...typography.bodyRegular, color: colors.primary, marginTop: spacing.xs },
});

export default HelpScreen;
