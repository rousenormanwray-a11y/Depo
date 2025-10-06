import apiClient from './api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'donation' | 'social' | 'milestone' | 'special' | 'referral' | 'marketplace';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  requiredCount: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward: {
    xp: number;
    coins?: number;
    badge?: string;
    title?: string;
  };
  isHidden: boolean; // Secret achievements
  rarity: number; // 0-100, how rare this achievement is
}

export interface UserAchievements {
  achievements: Achievement[];
  totalUnlocked: number;
  totalAvailable: number;
  completionPercentage: number;
  recentlyUnlocked: Achievement[];
  nextToUnlock: Achievement[];
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  requiredCount: number;
  percentage: number;
  isCompleted: boolean;
  canClaim: boolean;
}

/**
 * Achievement Service
 * Handles user achievements, unlocks, and progress tracking
 */
export const achievementService = {
  /**
   * Get all user achievements (unlocked and locked)
   */
  async getUserAchievements(): Promise<UserAchievements> {
    try {
      const response = await apiClient.get<UserAchievements>('/achievements/user');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user achievements:', error);
      throw error;
    }
  },

  /**
   * Get all available achievement definitions
   * @param includeHidden - Whether to include hidden/secret achievements
   */
  async getAchievementDefinitions(includeHidden = false): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/definitions', {
        params: { includeHidden },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievement definitions:', error);
      throw error;
    }
  },

  /**
   * Get achievements by category
   * @param category - Achievement category
   */
  async getAchievementsByCategory(
    category: 'donation' | 'social' | 'milestone' | 'special' | 'referral' | 'marketplace'
  ): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/category', {
        params: { category },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievements by category:', error);
      throw error;
    }
  },

  /**
   * Get specific achievement progress
   * @param achievementId - The achievement ID
   */
  async getAchievementProgress(achievementId: string): Promise<AchievementProgress> {
    try {
      const response = await apiClient.get<AchievementProgress>(
        `/achievements/${achievementId}/progress`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievement progress:', error);
      throw error;
    }
  },

  /**
   * Unlock an achievement
   * @param achievementId - The achievement ID to unlock
   */
  async unlockAchievement(achievementId: string): Promise<{
    success: boolean;
    achievement: Achievement;
    reward: {
      xp: number;
      coins?: number;
      badge?: string;
      title?: string;
    };
    isFirstUnlock: boolean;
  }> {
    try {
      const response = await apiClient.post(`/achievements/${achievementId}/unlock`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  },

  /**
   * Claim achievement reward
   * @param achievementId - The achievement ID to claim
   */
  async claimAchievement(achievementId: string): Promise<{
    success: boolean;
    reward: {
      xp: number;
      coins?: number;
      badge?: string;
      title?: string;
    };
  }> {
    try {
      const response = await apiClient.post(`/achievements/${achievementId}/claim`);
      return response.data;
    } catch (error) {
      console.error('Failed to claim achievement:', error);
      throw error;
    }
  },

  /**
   * Check if action triggers any achievements
   * @param action - Action type that might trigger achievements
   * @param metadata - Additional data about the action
   */
  async checkAchievementTriggers(
    action: string,
    metadata?: Record<string, any>
  ): Promise<{
    triggered: Achievement[];
    progress: Array<{
      achievementId: string;
      newProgress: number;
      requiredCount: number;
    }>;
  }> {
    try {
      const response = await apiClient.post('/achievements/check', {
        action,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check achievement triggers:', error);
      throw error;
    }
  },

  /**
   * Get recently unlocked achievements
   * @param limit - Number of recent achievements to fetch
   */
  async getRecentUnlocks(limit = 10): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent unlocks:', error);
      throw error;
    }
  },

  /**
   * Get achievements close to completion
   * @param threshold - Progress percentage threshold (e.g., 80 for 80%+)
   */
  async getNearCompletion(threshold = 80): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/near-completion', {
        params: { threshold },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch near completion achievements:', error);
      throw error;
    }
  },

  /**
   * Get user's achievement statistics
   */
  async getAchievementStats(): Promise<{
    totalUnlocked: number;
    totalAvailable: number;
    completionPercentage: number;
    byCategory: Record<
      string,
      {
        unlocked: number;
        total: number;
      }
    >;
    byTier: Record<
      string,
      {
        unlocked: number;
        total: number;
      }
    >;
    totalXPEarned: number;
    totalCoinsEarned: number;
    rareAchievements: Achievement[]; // Unlocked rare achievements
    rank: {
      position: number;
      total: number;
      percentile: number;
    };
  }> {
    try {
      const response = await apiClient.get('/achievements/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievement stats:', error);
      throw error;
    }
  },

  /**
   * Get achievement showcase (user's featured achievements)
   */
  async getShowcase(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/showcase');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch achievement showcase:', error);
      throw error;
    }
  },

  /**
   * Update achievement showcase
   * @param achievementIds - Array of achievement IDs to showcase (max 5)
   */
  async updateShowcase(achievementIds: string[]): Promise<{
    success: boolean;
    showcase: Achievement[];
  }> {
    try {
      const response = await apiClient.put('/achievements/showcase', {
        achievementIds,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update achievement showcase:', error);
      throw error;
    }
  },
};

export default achievementService;
