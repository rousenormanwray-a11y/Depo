import gamificationService from '../gamificationService';
import apiClient from '../api';

jest.mock('../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('gamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserGamification', () => {
    it('should fetch user gamification data', async () => {
      const mockResponse = {
        data: {
          userId: 'user-1',
          level: 5,
          currentXP: 250,
          xpToNextLevel: 500,
          totalXP: 1250,
          rank: 'Bronze',
          title: 'Generous Giver',
          stats: {
            totalDonations: 15,
            totalAmount: 50000,
            itemsRedeemed: 3,
            referrals: 2,
            loginStreak: 7,
          },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationService.getUserGamification();

      expect(mockApiClient.get).toHaveBeenCalledWith('/gamification/user');
      expect(result.level).toBe(5);
      expect(result.currentXP).toBe(250);
      expect(result.stats.totalDonations).toBe(15);
    });
  });

  describe('addXP', () => {
    it('should add XP to user account', async () => {
      const mockResponse = {
        data: {
          newXP: 350,
          totalXP: 1350,
          leveledUp: false,
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await gamificationService.addXP(100, 'Completed donation', 'donation');

      expect(mockApiClient.post).toHaveBeenCalledWith('/gamification/xp', {
        amount: 100,
        reason: 'Completed donation',
        source: 'donation',
      });
      expect(result.newXP).toBe(350);
      expect(result.leveledUp).toBe(false);
    });

    it('should handle level up when adding XP', async () => {
      const mockResponse = {
        data: {
          newXP: 0,
          totalXP: 1500,
          leveledUp: true,
          newLevel: 6,
          rewards: {
            coins: 100,
            badge: 'Level 6 Master',
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await gamificationService.addXP(500, 'Large donation', 'donation');

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(6);
      expect(result.rewards).toBeDefined();
    });
  });

  describe('getQuests', () => {
    it('should fetch all quests', async () => {
      const mockResponse = {
        data: [
          {
            id: 'quest-1',
            title: 'Daily Donation',
            description: 'Make 1 donation today',
            type: 'daily',
            targetType: 'donation',
            targetCount: 1,
            currentProgress: 0,
            xpReward: 50,
            status: 'active',
            createdAt: '2025-10-06T00:00:00Z',
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationService.getQuests();

      expect(mockApiClient.get).toHaveBeenCalledWith('/gamification/quests', {
        params: { type: undefined },
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Daily Donation');
    });

    it('should fetch daily quests only', async () => {
      const mockResponse = {
        data: [
          {
            id: 'quest-1',
            title: 'Daily Donation',
            type: 'daily',
            status: 'active',
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationService.getQuests('daily');

      expect(mockApiClient.get).toHaveBeenCalledWith('/gamification/quests', {
        params: { type: 'daily' },
      });
      expect(result[0].type).toBe('daily');
    });
  });

  describe('completeQuest', () => {
    it('should complete a quest successfully', async () => {
      const mockResponse = {
        data: {
          quest: {
            id: 'quest-1',
            status: 'completed',
          },
          rewards: {
            xp: 50,
            coins: 10,
          },
          leveledUp: false,
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await gamificationService.completeQuest('quest-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/gamification/quests/quest-1/complete');
      expect(result.quest.status).toBe('completed');
      expect(result.rewards.xp).toBe(50);
    });
  });

  describe('claimDailyReward', () => {
    it('should claim daily reward', async () => {
      const mockResponse = {
        data: {
          success: true,
          rewards: {
            xp: 25,
            coins: 5,
            streak: 7,
          },
          nextRewardIn: 86400, // 24 hours
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await gamificationService.claimDailyReward();

      expect(mockApiClient.post).toHaveBeenCalledWith('/gamification/daily-reward');
      expect(result.success).toBe(true);
      expect(result.rewards.streak).toBe(7);
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard', async () => {
      const mockResponse = {
        data: {
          rankings: [
            {
              rank: 1,
              userId: 'user-1',
              username: 'TopDonor',
              level: 10,
              totalXP: 5000,
              totalDonations: 50,
            },
          ],
          userRank: 15,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationService.getLeaderboard('weekly', 100);

      expect(mockApiClient.get).toHaveBeenCalledWith('/gamification/leaderboard', {
        params: { period: 'weekly', limit: 100 },
      });
      expect(result.rankings).toHaveLength(1);
      expect(result.rankings[0].rank).toBe(1);
    });
  });
});
