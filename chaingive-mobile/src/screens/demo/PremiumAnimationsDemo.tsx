import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import all premium animations
import {
  ConfettiCelebration,
  AchievementUnlockAnimation,
  LevelUpAnimation,
  DonationSuccessAnimation,
  ParticleEffect,
  FloatingHearts,
  PulseRing,
  FlipCard,
  MorphingFAB,
  ShimmerEffect,
  StreakFlame,
  CountUpAnimation,
  PageTransition,
  LottieSuccess,
  LottieError,
  LottieLoading,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');

const PremiumAnimationsDemo: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showLottieSuccess, setShowLottieSuccess] = useState(false);
  const [showLottieError, setShowLottieError] = useState(false);

  const demoSections = [
    {
      title: 'Celebration Animations',
      items: [
        {
          name: 'Confetti Celebration',
          icon: 'celebration',
          color: colors.gold,
          onPress: () => setShowConfetti(true),
        },
        {
          name: 'Achievement Unlock',
          icon: 'emoji-events',
          color: colors.gold,
          onPress: () => setShowAchievement(true),
        },
        {
          name: 'Level Up',
          icon: 'trending-up',
          color: colors.success,
          onPress: () => setShowLevelUp(true),
        },
        {
          name: 'Donation Success',
          icon: 'favorite',
          color: colors.error,
          onPress: () => setShowDonationSuccess(true),
        },
      ],
    },
    {
      title: 'Particle Effects',
      items: [
        {
          name: 'Particle Burst',
          icon: 'grain',
          color: colors.primary,
          onPress: () => setShowParticles(true),
        },
        {
          name: 'Floating Hearts',
          icon: 'favorite',
          color: colors.error,
          onPress: () => setShowHearts(true),
        },
      ],
    },
    {
      title: 'Lottie Animations',
      items: [
        {
          name: 'Success',
          icon: 'check-circle',
          color: colors.success,
          onPress: () => setShowLottieSuccess(true),
        },
        {
          name: 'Error',
          icon: 'error',
          color: colors.error,
          onPress: () => setShowLottieError(true),
        },
      ],
    },
  ];

  const fabActions = [
    {
      icon: 'favorite',
      label: 'Donate',
      color: colors.error,
      onPress: () => alert('Donate'),
    },
    {
      icon: 'shopping-cart',
      label: 'Shop',
      color: colors.secondary,
      onPress: () => alert('Shop'),
    },
    {
      icon: 'person-add',
      label: 'Invite',
      color: colors.success,
      onPress: () => alert('Invite'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <PageTransition type="slideUp">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Premium Animations</Text>
          <Text style={styles.headerSubtitle}>Tap to preview each animation</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Demo Sections */}
          {demoSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.grid}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.demoCard}
                    onPress={item.onPress}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                      <Icon name={item.icon} size={32} color={item.color} />
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Interactive Components */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interactive Components</Text>

            {/* Flip Card */}
            <FlipCard
              frontContent={
                <View style={styles.cardFront}>
                  <Icon name="credit-card" size={40} color={colors.white} />
                  <Text style={styles.cardText}>Tap to Flip</Text>
                </View>
              }
              backContent={
                <View style={styles.cardBack}>
                  <Text style={styles.cardBackText}>Card Back</Text>
                  <Text style={styles.cardBackSubtext}>Tap to flip back</Text>
                </View>
              }
              style={styles.flipCard}
            />

            {/* Pulse Ring */}
            <View style={styles.pulseContainer}>
              <Text style={styles.componentLabel}>Pulse Ring</Text>
              <PulseRing size={80} color={colors.primary} count={3} />
            </View>

            {/* Streak Flame */}
            <View style={styles.streakContainer}>
              <Text style={styles.componentLabel}>Streak Flame</Text>
              <View style={styles.streakRow}>
                <StreakFlame days={0} size="small" />
                <StreakFlame days={5} size="medium" />
                <StreakFlame days={15} size="medium" />
                <StreakFlame days={35} size="large" />
              </View>
            </View>

            {/* Count Up */}
            <View style={styles.countContainer}>
              <Text style={styles.componentLabel}>Count Up Animation</Text>
              <CountUpAnimation
                from={0}
                to={125000}
                duration={2000}
                formatter={(val) => `₦${val.toLocaleString('en-NG')}`}
                style={styles.countText}
                easing="easeOut"
              />
            </View>

            {/* Shimmer Effect */}
            <View style={styles.shimmerContainer}>
              <Text style={styles.componentLabel}>Shimmer Loading</Text>
              <ShimmerEffect width="100%" height={60} borderRadius={12} />
            </View>
          </View>

          {/* Bottom padding for FAB */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Morphing FAB */}
        <MorphingFAB
          mainIcon="add"
          mainColor={colors.primary}
          actions={fabActions}
          position="bottom-right"
        />

        {/* Animation Modals */}
        <ConfettiCelebration
          visible={showConfetti}
          onComplete={() => setShowConfetti(false)}
          message="🎉 Amazing!"
          submessage="You've unlocked a new achievement"
        />

        <AchievementUnlockAnimation
          visible={showAchievement}
          achievementName="First Donation"
          achievementDescription="Complete your first donation to help others"
          achievementIcon="favorite"
          badge="gold"
          points={100}
          onComplete={() => setShowAchievement(false)}
        />

        <LevelUpAnimation
          visible={showLevelUp}
          newLevel={15}
          rewards={[
            'Unlock premium marketplace items',
            '+5% donation match bonus',
            'Exclusive donor badge',
          ]}
          onComplete={() => setShowLevelUp(false)}
        />

        <LottieSuccess
          visible={showLottieSuccess}
          onAnimationFinish={() => setShowLottieSuccess(false)}
        />

        <LottieError
          visible={showLottieError}
          onAnimationFinish={() => setShowLottieError(false)}
        />

        {/* Particle Effects Overlay */}
        {showParticles && (
          <View style={styles.particleOverlay} pointerEvents="none">
            <ParticleEffect count={40} duration={2000} />
          </View>
        )}

        {showHearts && (
          <View style={styles.particleOverlay} pointerEvents="none">
            <FloatingHearts
              count={20}
              startX={screenWidth / 2}
              startY={200}
            />
          </View>
        )}
      </PageTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  demoCard: {
    width: (screenWidth - (spacing.md * 3)) / 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    textAlign: 'center',
  },
  flipCard: {
    marginBottom: spacing.lg,
  },
  cardFront: {
    height: 150,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  cardText: {
    ...typography.bodyBold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  cardBack: {
    height: 150,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  cardBackText: {
    ...typography.h3,
    color: colors.white,
  },
  cardBackSubtext: {
    ...typography.bodySmall,
    color: colors.white,
    marginTop: spacing.xs,
  },
  pulseContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  componentLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  streakContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  countContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  countText: {
    ...typography.h1,
    fontSize: 36,
    color: colors.success,
  },
  shimmerContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  particleOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default PremiumAnimationsDemo;
