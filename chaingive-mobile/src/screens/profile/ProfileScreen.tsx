import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  StreakFlame,
  LevelBadge,
  AchievementBadge,
  ProgressRing,
  CountUpAnimation,
  PageTransition,
  AchievementUnlockAnimation,
} from '../../components/animations';
import GradientCard from '../../components/common/GradientCard';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mock data for gamification (replace with real data from Redux)
  const userLevel = 15;
  const loginStreak = 12;
  const profileCompletion = 75;
  const totalDonations = 42;
  const totalGiven = 125000;
  const livesTouched = 28;
  
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  
  const achievements = [
    {
      id: '1',
      name: 'First Donation',
      description: 'Made your first donation',
      icon: 'favorite',
      unlocked: true,
      progress: 1,
      badge: 'gold' as const,
      points: 100,
    },
    {
      id: '2',
      name: 'Generous Giver',
      description: 'Made 50 donations',
      icon: 'volunteer-activism',
      unlocked: false,
      progress: 0.84,
      badge: 'platinum' as const,
      points: 500,
    },
    {
      id: '3',
      name: '100K Club',
      description: 'Given over ₦100,000',
      icon: 'trending-up',
      unlocked: true,
      progress: 1,
      badge: 'gold' as const,
      points: 1000,
    },
  ];
  
  // Mock data for demonstration
  const [loginStreak, setLoginStreak] = useState(15);
  const [userLevel, setUserLevel] = useState(12);
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [showAchievement, setShowAchievement] = useState(false);
  
  const achievements = [
    {
      id: '1',
      name: 'First Donation',
      description: 'Complete your first donation',
      icon: 'favorite',
      unlocked: true,
      progress: 1,
      badge: 'bronze' as const,
      points: 100,
      shine: false,
    },
    {
      id: '2',
      name: 'Generous Giver',
      description: 'Make 10 donations',
      icon: 'volunteer-activism',
      unlocked: true,
      progress: 1,
      badge: 'gold' as const,
      points: 500,
      shine: true,
    },
    {
      id: '3',
      name: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      icon: 'whatshot',
      unlocked: false,
      progress: 0.5,
      badge: 'platinum' as const,
      points: 1000,
      shine: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <PageTransition type="fade" duration={300}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Settings');
          }}>
            <Icon name="settings" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header with Gamification */}
          <GradientCard
            colors={[colors.primary, colors.primaryDark]}
            style={styles.profileHeader}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Text>
              </View>
              <LevelBadge level={userLevel} size="medium" showIcon />
            </View>

            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {/* Streak Flame */}
              <View style={styles.statItem}>
                <StreakFlame days={loginStreak} size="medium" animate showNumber />
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>

              {/* Profile Completion */}
              <View style={styles.statItem}>
                <ProgressRing
                  progress={profileCompletion / 100}
                  size={70}
                  strokeWidth={6}
                  color={colors.gold}
                  showPercentage
                />
                <Text style={styles.statLabel}>Complete</Text>
              </View>

              {/* Total Donations */}
              <View style={styles.statItem}>
                <View style={styles.donationCircle}>
                  <CountUpAnimation
                    from={0}
                    to={user?.totalDonations || 12}
                    duration={1500}
                    style={styles.donationCount}
                  />
                </View>
                <Text style={styles.statLabel}>Donations</Text>
              </View>
            </View>
          </GradientCard>

          {/* Achievements Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                {...achievement}
                onPress={() => {
                  if (achievement.unlocked) {
                    setShowAchievement(true);
                  }
                }}
              />
            ))}
          </View>

          {/* Menu */}
          <View style={styles.section}>
            <View style={styles.menu}>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('EditProfile');
              }}>
                <Icon name="person" size={20} color={colors.text.primary} />
                <Text style={styles.menuText}>Edit Profile</Text>
                <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('KYCVerification');
              }}>
                <Icon name="verified-user" size={20} color={colors.text.primary} />
                <Text style={styles.menuText}>Security & KYC</Text>
                <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Notifications');
              }}>
                <Icon name="notifications" size={20} color={colors.text.primary} />
                <Text style={styles.menuText}>Notifications</Text>
                <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Help');
              }}>
                <Icon name="help" size={20} color={colors.text.primary} />
                <Text style={styles.menuText}>Help & Support</Text>
                <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Achievement Unlock Animation */}
        <AchievementUnlockAnimation
          visible={showAchievement}
          achievementName="Generous Giver"
          achievementDescription="Made 10 donations to help others"
          achievementIcon="volunteer-activism"
          badge="gold"
          points={500}
          onComplete={() => setShowAchievement(false)}
        />
      </PageTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light, ...shadows.small },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: spacing.xl },
  profileHeader: { margin: spacing.md, padding: spacing.xl, alignItems: 'center' },
  avatarContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', ...shadows.medium },
  avatarText: { ...typography.h1, color: colors.primary, fontWeight: '700' },
  name: { ...typography.h2, color: colors.white, marginBottom: spacing.xs },
  email: { ...typography.bodySmall, color: colors.white, opacity: 0.9, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: `${colors.white}30` },
  statItem: { alignItems: 'center' },
  statLabel: { ...typography.caption, color: colors.white, marginTop: spacing.sm, fontWeight: '600' },
  donationCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', ...shadows.medium },
  donationCount: { ...typography.h2, color: colors.primary, fontWeight: '800' },
  section: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text.primary },
  viewAllText: { ...typography.bodySmallBold, color: colors.primary },
  menu: { backgroundColor: colors.white, borderRadius: 12, ...shadows.card },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  menuText: { flex: 1, marginLeft: spacing.sm, ...typography.bodyRegular, color: colors.text.primary },
});

export default ProfileScreen;
