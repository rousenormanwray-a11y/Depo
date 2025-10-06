import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { colors } from '../../theme/colors';

interface AchievementUnlockModalProps {
  visible: boolean;
  achievement: {
    name: string;
    description: string;
    icon: string;
    tier: string;
    rewardCoins: number;
    color: string;
  } | null;
  onClose: () => void;
  onShare?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AchievementUnlockModal({
  visible,
  achievement,
  onClose,
  onShare,
}: AchievementUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible && achievement) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Fire confetti after slight delay
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  const getTierGradient = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond':
        return ['#B9F2FF', '#89CFF0'];
      case 'platinum':
        return ['#E5E4E2', '#C0C0C0'];
      case 'gold':
        return ['#FFD700', '#FFA500'];
      case 'silver':
        return ['#C0C0C0', '#808080'];
      default:
        return ['#CD7F32', '#8B4513'];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: screenWidth / 2, y: screenHeight / 3 }}
          autoStart={false}
          fadeOut
        />

        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={getTierGradient(achievement.tier)}
            style={styles.gradient}
          >
            {/* Badge */}
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: achievement.color || getTierGradient(achievement.tier)[0] },
                ]}
              >
                <MaterialCommunityIcons
                  name={achievement.icon as any}
                  size={80}
                  color="#FFF"
                />
              </View>

              {/* Glow effect */}
              <View style={[styles.glow, { backgroundColor: achievement.color }]} />
            </View>

            {/* Title */}
            <Text style={styles.unlockText}>Achievement Unlocked!</Text>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>

            {/* Tier Badge */}
            <View style={styles.tierBadge}>
              <MaterialCommunityIcons name="star-circle" size={20} color="#FFD700" />
              <Text style={styles.tierText}>{achievement.tier.toUpperCase()}</Text>
            </View>

            {/* Reward */}
            <View style={styles.rewardContainer}>
              <MaterialCommunityIcons name="coin" size={32} color="#FFD700" />
              <Text style={styles.rewardText}>+{achievement.rewardCoins}</Text>
              <Text style={styles.rewardLabel}>Charity Coins</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {onShare && (
                <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                  <MaterialCommunityIcons name="share-variant" size={24} color={colors.primary} />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  badge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  unlockText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rewardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 32,
  },
  rewardText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  closeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
