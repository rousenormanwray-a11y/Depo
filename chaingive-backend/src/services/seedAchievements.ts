import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Seed default achievements
 * Run this once to populate the achievements table
 */

const DEFAULT_ACHIEVEMENTS = [
  // ============================================
  // DONATION ACHIEVEMENTS
  // ============================================
  {
    code: 'first_donation',
    name: '🎉 First Donation',
    description: 'Make your first donation',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 1,
    rewardCoins: 50,
    tier: 'bronze',
    icon: 'gift',
    color: '#CD7F32',
  },
  {
    code: 'bronze_giver',
    name: '🥉 Bronze Giver',
    description: 'Make 10 donations',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 10,
    rewardCoins: 200,
    tier: 'bronze',
    icon: 'volunteer-activism',
    color: '#CD7F32',
  },
  {
    code: 'silver_giver',
    name: '🥈 Silver Giver',
    description: 'Make 50 donations',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 50,
    rewardCoins: 500,
    tier: 'silver',
    icon: 'volunteer-activism',
    color: '#C0C0C0',
  },
  {
    code: 'gold_giver',
    name: '🥇 Gold Giver',
    description: 'Make 100 donations',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 100,
    rewardCoins: 1000,
    tier: 'gold',
    icon: 'volunteer-activism',
    color: '#FFD700',
  },
  {
    code: 'platinum_giver',
    name: '💎 Platinum Giver',
    description: 'Make 250 donations',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 250,
    rewardCoins: 2500,
    tier: 'platinum',
    icon: 'volunteer-activism',
    color: '#E5E4E2',
  },
  {
    code: 'diamond_giver',
    name: '💎 Diamond Giver',
    description: 'Make 500 donations',
    category: 'donations',
    requirementType: 'donation_count',
    requirementValue: 500,
    rewardCoins: 5000,
    tier: 'diamond',
    icon: 'volunteer-activism',
    color: '#B9F2FF',
  },
  
  // ============================================
  // STREAK ACHIEVEMENTS
  // ============================================
  {
    code: 'week_warrior',
    name: '🔥 Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streaks',
    requirementType: 'streak_days',
    requirementValue: 7,
    rewardCoins: 100,
    tier: 'bronze',
    icon: 'local-fire-department',
    color: '#FF4500',
  },
  {
    code: 'month_master',
    name: '🔥 Month Master',
    description: 'Maintain a 30-day streak',
    category: 'streaks',
    requirementType: 'streak_days',
    requirementValue: 30,
    rewardCoins: 500,
    tier: 'silver',
    icon: 'local-fire-department',
    color: '#FF6347',
  },
  {
    code: 'streak_legend',
    name: '🔥 Streak Legend',
    description: 'Maintain a 90-day streak',
    category: 'streaks',
    requirementType: 'streak_days',
    requirementValue: 90,
    rewardCoins: 2000,
    tier: 'gold',
    icon: 'local-fire-department',
    color: '#FF8C00',
  },
  {
    code: 'year_champion',
    name: '🔥 Year Champion',
    description: 'Maintain a 365-day streak',
    category: 'streaks',
    requirementType: 'streak_days',
    requirementValue: 365,
    rewardCoins: 10000,
    tier: 'diamond',
    icon: 'local-fire-department',
    color: '#FFD700',
  },
  
  // ============================================
  // REFERRAL ACHIEVEMENTS
  // ============================================
  {
    code: 'social_butterfly',
    name: '🦋 Social Butterfly',
    description: 'Refer 3 friends',
    category: 'referrals',
    requirementType: 'referral_count',
    requirementValue: 3,
    rewardCoins: 300,
    tier: 'bronze',
    icon: 'people',
    color: '#87CEEB',
  },
  {
    code: 'super_referrer',
    name: '🤝 Super Referrer',
    description: 'Refer 10 friends',
    category: 'referrals',
    requirementType: 'referral_count',
    requirementValue: 10,
    rewardCoins: 1500,
    tier: 'silver',
    icon: 'people',
    color: '#4169E1',
  },
  {
    code: 'viral_champion',
    name: '🚀 Viral Champion',
    description: 'Refer 50 friends',
    category: 'referrals',
    requirementType: 'referral_count',
    requirementValue: 50,
    rewardCoins: 10000,
    tier: 'gold',
    icon: 'people',
    color: '#0000CD',
  },
  
  // ============================================
  // COIN ACHIEVEMENTS
  // ============================================
  {
    code: 'coin_collector',
    name: '🪙 Coin Collector',
    description: 'Buy 1,000 coins total',
    category: 'coins',
    requirementType: 'coin_purchase_total',
    requirementValue: 1000,
    rewardCoins: 250,
    tier: 'bronze',
    icon: 'monetization-on',
    color: '#FFD700',
  },
  {
    code: 'coin_master',
    name: '🪙 Coin Master',
    description: 'Buy 5,000 coins total',
    category: 'coins',
    requirementType: 'coin_purchase_total',
    requirementValue: 5000,
    rewardCoins: 1000,
    tier: 'silver',
    icon: 'monetization-on',
    color: '#FFD700',
  },
  {
    code: 'whale',
    name: '🐋 Whale',
    description: 'Buy 20,000 coins total',
    category: 'coins',
    requirementType: 'coin_purchase_total',
    requirementValue: 20000,
    rewardCoins: 5000,
    tier: 'gold',
    icon: 'monetization-on',
    color: '#FFD700',
  },
  
  // ============================================
  // SPECIAL ACHIEVEMENTS
  // ============================================
  {
    code: 'perfect_week',
    name: '⭕ Perfect Week',
    description: 'Close all rings 7 days in a row',
    category: 'special',
    requirementType: 'perfect_days',
    requirementValue: 7,
    rewardCoins: 500,
    tier: 'gold',
    icon: 'verified',
    color: '#00FF00',
  },
  {
    code: 'early_adopter',
    name: '🌟 Early Adopter',
    description: 'Join ChainGive in the first month',
    category: 'special',
    requirementType: 'registration_date',
    requirementValue: 30,
    rewardCoins: 1000,
    tier: 'platinum',
    icon: 'star',
    color: '#FFD700',
    isSecret: true,
  },
];

export async function seedAchievements() {
  try {
    logger.info('Seeding default achievements...');
    
    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { code: achievement.code },
        create: achievement,
        update: achievement,
      });
    }
    
    logger.info(`✅ Seeded ${DEFAULT_ACHIEVEMENTS.length} achievements`);
    return { success: true, count: DEFAULT_ACHIEVEMENTS.length };
  } catch (error) {
    logger.error('Error seeding achievements:', error);
    throw error;
  }
}

export async function seedMissionTemplates() {
  try {
    logger.info('Seeding default mission templates...');
    
    const templates = [
      {
        type: 'donate',
        name: 'Make a Donation',
        description: 'Give forward to help someone in need',
        reward: 50,
        icon: 'favorite',
        priority: 10,
      },
      {
        type: 'buy_coins',
        name: 'Buy Coins',
        description: 'Purchase at least 10 charity coins',
        reward: 30,
        icon: 'monetization-on',
        priority: 9,
      },
      {
        type: 'refer',
        name: 'Share Referral',
        description: 'Share your referral code with a friend',
        reward: 20,
        icon: 'share',
        priority: 8,
      },
      {
        type: 'leaderboard',
        name: 'Check Leaderboard',
        description: 'View your ranking and compete',
        reward: 15,
        icon: 'emoji-events',
        priority: 7,
      },
      {
        type: 'marketplace',
        name: 'Browse Marketplace',
        description: 'Explore marketplace items',
        reward: 15,
        icon: 'store',
        priority: 6,
      },
      {
        type: 'profile_update',
        name: 'Update Profile',
        description: 'Complete your profile information',
        reward: 10,
        icon: 'person',
        priority: 5,
      },
    ];
    
    for (const template of templates) {
      await prisma.missionTemplate.upsert({
        where: { 
          type: template.type 
        },
        create: template,
        update: template,
      });
    }
    
    logger.info(`✅ Seeded ${templates.length} mission templates`);
    return { success: true, count: templates.length };
  } catch (error) {
    logger.error('Error seeding mission templates:', error);
    throw error;
  }
}

export default {
  seedAchievements,
  seedMissionTemplates,
};
