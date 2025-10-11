import apiClient from './api';

export interface UserGamification {
  userId: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: string;
  title: string;
  stats: {
    totalDonations: number;
    totalAmount: number;
    itemsRedeemed: number;
    referrals: number;
    loginStreak: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  targetType: 'donation' | 'login' | 'referral' | 'marketplace' | 'agent';
  targetCount: number;
  currentProgress: number;
  xpReward: number;
  coinsReward?: number;
  status: 'active' | 'completed' | 'claimed' | 'expired';
  expiresAt?: string;
  createdAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  source: 'donation' | 'quest' | 'achievement' | 'referral' | 'daily' | 'bonus';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LevelUpResponse {
  newLevel: number;
  rewards: {
    coins?: number;
    badge?: string;
    title?: string;
  };
  nextLevelXP: number;
}

/**
 * Gamification Service
 * Handles XP, levels, quests, and gamification features
 */
export const gamificationService = {
  /**
   * Get current user's gamification data
   */
  async getUserGamification(): Promise<UserGamification> {
    try {
      const response = await apiClient.get<UserGamification>('/gamification/user');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user gamification:', error);
      throw error;
    }
  },

  /**
   * Get user's level information
   */
  async getUserLevel(): Promise<{
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    totalXP: number;
    rank: string;
  }> {
    try {
      const response = await apiClient.get('/gamification/level');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user level:', error);
      throw error;
    }
  },

  /**
   * Get user's XP (experience points)
   */
  async getUserXP(): Promise<{
    currentXP: number;
    totalXP: number;
    todayXP: number;
    weekXP: number;
  }> {
    try {
      const response = await apiClient.get('/gamification/xp');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user XP:', error);
      throw error;
    }
  },

  /**
   * Add XP to user's account
   * @param amount - Amount of XP to add
   * @param reason - Reason for XP gain
   * @param source - Source of XP (donation, quest, etc.)
   */
  async addXP(
    amount: number,
    reason: string,
    source: 'donation' | 'quest' | 'achievement' | 'referral' | 'daily' | 'bonus' = 'bonus'
  ): Promise<{
    newXP: number;
    totalXP: number;
    leveledUp: boolean;
    newLevel?: number;
    rewards?: any;
  }> {
    try {
      const response = await apiClient.post('/gamification/xp', {
        amount,
        reason,
        source,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add XP:', error);
      throw error;
    }
  },

  /**
   * Trigger level up for user
   */
  async levelUp(): Promise<LevelUpResponse> {
    try {
      const response = await apiClient.post<LevelUpResponse>('/gamification/level-up');
      return response.data;
    } catch (error) {
      console.error('Failed to level up:', error);
      throw error;
    }
  },

  /**
   * Get all available quests for the user
   * @param type - Filter by quest type (daily, weekly, etc.)
   */
  async getQuests(type?: 'daily' | 'weekly' | 'monthly' | 'special'): Promise<Quest[]> {
    try {
      const response = await apiClient.get<Quest[]>('/gamification/quests', {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      throw error;
    }
  },

  /**
   * Get daily quests
   */
  async getDailyQuests(): Promise<Quest[]> {
    return this.getQuests('daily');
  },

  /**
   * Get weekly quests
   */
  async getWeeklyQuests(): Promise<Quest[]> {
    return this.getQuests('weekly');
  },

  /**
   * Complete a quest
   * @param questId - The quest ID to complete
   */
  async completeQuest(questId: string): Promise<{
    quest: Quest;
    rewards: {
      xp: number;
      coins?: number;
    };
    leveledUp: boolean;
    newLevel?: number;
  }> {
    try {
      const response = await apiClient.post(`/gamification/quests/${questId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Failed to complete quest:', error);
      throw error;
    }
  },

  /**
   * Claim quest rewards
   * @param questId - The quest ID to claim rewards for
   */
  async claimQuestReward(questId: string): Promise<{
    success: boolean;
    rewards: {
      xp: number;
      coins?: number;
    };
  }> {
    try {
      const response = await apiClient.post(`/gamification/quests/${questId}/claim`);
      return response.data;
    } catch (error) {
      console.error('Failed to claim quest reward:', error);
      throw error;
    }
  },

  /**
   * Claim daily login reward
   */
  async claimDailyReward(): Promise<{
    success: boolean;
    rewards: {
      xp: number;
      coins?: number;
      streak: number;
    };
    nextRewardIn: number; // seconds until next reward
  }> {
    try {
      const response = await apiClient.post('/gamification/daily-reward');
      return response.data;
    } catch (error) {
      console.error('Failed to claim daily reward:', error);
      throw error;
    }
  },

  /**
   * Get XP transaction history
   * @param limit - Number of transactions to fetch
   */
  async getXPHistory(limit = 50): Promise<XPTransaction[]> {
    try {
      const response = await apiClient.get<XPTransaction[]>('/gamification/xp/history', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch XP history:', error);
      throw error;
    }
  },

  /**
   * Get leaderboard rankings
   * @param period - Time period for rankings (all-time, weekly, monthly)
   * @param limit - Number of top users to fetch
   */
  async getLeaderboard(
    period: 'all' | 'weekly' | 'monthly' = 'all',
    limit = 100
  ): Promise<{
    rankings: Array<{
      rank: number;
      userId: string;
      username: string;
      avatar?: string;
      level: number;
      totalXP: number;
      totalDonations: number;
    }>;
    userRank?: number;
  }> {
    try {
      const response = await apiClient.get('/gamification/leaderboard', {
        params: { period, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get user's rank on leaderboard
   */
  async getUserRank(): Promise<{
    rank: number;
    total: number;
    percentile: number;
  }> {
    try {
      const response = await apiClient.get('/gamification/rank');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user rank:', error);
      throw error;
    }
  },
};

export default gamificationService;
