import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.tier}>🏅 {user?.tier}</Text>
        <Text style={styles.trust}>⭐ Trust Score: {user?.trustScore}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="person" size={20} color={colors.text.primary} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('KYCVerification')}>
          <Icon name="verified-user" size={20} color={colors.text.primary} />
          <Text style={styles.menuText}>Security & KYC</Text>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications" size={20} color={colors.text.primary} />
          <Text style={styles.menuText}>Notifications</Text>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
          <Icon name="help" size={20} color={colors.text.primary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  profileHeader: { alignItems: 'center', padding: layout.screenPadding, backgroundColor: colors.white, margin: layout.screenPadding, borderRadius: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gray[200], marginBottom: spacing.sm },
  name: { ...typography.h2, color: colors.text.primary },
  tier: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.xs },
  trust: { ...typography.bodyRegular, color: colors.text.secondary, marginTop: spacing.xs },
  menu: { backgroundColor: colors.white, marginHorizontal: layout.screenPadding, borderRadius: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  menuText: { flex: 1, marginLeft: spacing.sm, ...typography.bodyRegular, color: colors.text.primary },
});

export default ProfileScreen;
