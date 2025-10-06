import apiClient from './api';

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakType: 'login' | 'donation' | 'both';
  milestones: {
    days: number;
    reachedAt: string;
    reward?: {
      xp?: number;
      coins?: number;
      badge?: string;
    };
  }[];
}

export interface StreakCalendarDay {
  date: string;
  hasActivity: boolean;
  activityType?: 'login' | 'donation' | 'both';
  isPartOfStreak: boolean;
}

export interface StreakReward {
  streakDays: number;
  xp: number;
  coins?: number;
  badge?: string;
  title?: string;
}

/**
 * Streak Service
 * Handles login streaks, donation streaks, and streak rewards
 */
export const streakService = {
  /**
   * Get current user's streak information
   */
  async getCurrentStreak(): Promise<Streak> {
    try {
      const response = await apiClient.get<Streak>('/streaks/current');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current streak:', error);
      throw error;
    }
  },

  /**
   * Update login streak (called on app open)
   */
  async updateLoginStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    isNewRecord: boolean;
    reward?: {
      xp: number;
      coins?: number;
    };
    milestoneReached?: {
      days: number;
      reward: any;
    };
  }> {
    try {
      const response = await apiClient.post('/streaks/login');
      return response.data;
    } catch (error) {
      console.error('Failed to update login streak:', error);
      throw error;
    }
  },

  /**
   * Update donation streak (called after donation)
   */
  async updateDonationStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    isNewRecord: boolean;
    reward?: {
      xp: number;
      coins?: number;
    };
  }> {
    try {
      const response = await apiClient.post('/streaks/donation');
      return response.data;
    } catch (error) {
      console.error('Failed to update donation streak:', error);
      throw error;
    }
  },

  /**
   * Get streak calendar for a specific month
   * @param month - Month (1-12)
   * @param year - Year (e.g., 2025)
   */
  async getStreakCalendar(month: number, year: number): Promise<StreakCalendarDay[]> {
    try {
      const response = await apiClient.get<StreakCalendarDay[]>('/streaks/calendar', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch streak calendar:', error);
      throw error;
    }
  },

  /**
   * Get available streak rewards and milestones
   */
  async getStreakRewards(): Promise<StreakReward[]> {
    try {
      const response = await apiClient.get<StreakReward[]>('/streaks/rewards');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch streak rewards:', error);
      throw error;
    }
  },

  /**
   * Get streak statistics
   */
  async getStreakStats(): Promise<{
    totalDaysActive: number;
    currentLoginStreak: number;
    longestLoginStreak: number;
    currentDonationStreak: number;
    longestDonationStreak: number;
    perfectWeeks: number;
    perfectMonths: number;
    totalRewardsEarned: {
      xp: number;
      coins: number;
    };
  }> {
    try {
      const response = await apiClient.get('/streaks/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch streak stats:', error);
      throw error;
    }
  },

  /**
   * Get streak history
   * @param limit - Number of streak periods to fetch
   */
  async getStreakHistory(limit = 30): Promise<{
    history: Array<{
      date: string;
      streakCount: number;
      activityType: 'login' | 'donation' | 'both';
      rewardEarned?: {
        xp: number;
        coins?: number;
      };
    }>;
  }> {
    try {
      const response = await apiClient.get('/streaks/history', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch streak history:', error);
      throw error;
    }
  },

  /**
   * Check if streak is about to break (remind user)
   */
  async checkStreakStatus(): Promise<{
    isActive: boolean;
    willBreakIn: number; // hours
    shouldRemind: boolean;
    currentStreak: number;
  }> {
    try {
      const response = await apiClient.get('/streaks/status');
      return response.data;
    } catch (error) {
      console.error('Failed to check streak status:', error);
      throw error;
    }
  },

  /**
   * Claim streak milestone reward
   * @param milestoneId - The milestone ID to claim
   */
  async claimMilestoneReward(milestoneId: string): Promise<{
    success: boolean;
    reward: {
      xp: number;
      coins?: number;
      badge?: string;
      title?: string;
    };
  }> {
    try {
      const response = await apiClient.post(`/streaks/milestones/${milestoneId}/claim`);
      return response.data;
    } catch (error) {
      console.error('Failed to claim milestone reward:', error);
      throw error;
    }
  },
};

export default streakService;
