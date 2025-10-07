import achievementService from '../achievementService';
import apiClient from '../api';

jest.mock('../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('achievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAchievements', () => {
    it('should fetch user achievements successfully', async () => {
      const mockResponse = {
        data: {
          achievements: [
            {
              id: 'ach-1',
              name: 'First Donation',
              description: 'Make your first donation',
              category: 'donation',
              tier: 'bronze',
              icon: 'favorite',
              requiredCount: 1,
              currentProgress: 1,
              unlocked: true,
              unlockedAt: '2025-10-06T00:00:00Z',
              reward: { xp: 100, coins: 10 },
              isHidden: false,
              rarity: 10,
            },
          ],
          totalUnlocked: 1,
          totalAvailable: 50,
          completionPercentage: 2,
          recentlyUnlocked: [],
          nextToUnlock: [],
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await achievementService.getUserAchievements();

      expect(mockApiClient.get).toHaveBeenCalledWith('/achievements/user');
      expect(result.achievements).toHaveLength(1);
      expect(result.totalUnlocked).toBe(1);
      expect(result.completionPercentage).toBe(2);
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          achievement: {
            id: 'ach-2',
            name: 'Generous Giver',
            unlocked: true,
          },
          reward: { xp: 200, coins: 20, badge: 'Generous' },
          isFirstUnlock: true,
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await achievementService.unlockAchievement('ach-2');

      expect(mockApiClient.post).toHaveBeenCalledWith('/achievements/ach-2/unlock');
      expect(result.success).toBe(true);
      expect(result.achievement.unlocked).toBe(true);
      expect(result.isFirstUnlock).toBe(true);
    });
  });

  describe('getAchievementProgress', () => {
    it('should get achievement progress', async () => {
      const mockResponse = {
        data: {
          achievementId: 'ach-3',
          currentProgress: 5,
          requiredCount: 10,
          percentage: 50,
          isCompleted: false,
          canClaim: false,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await achievementService.getAchievementProgress('ach-3');

      expect(mockApiClient.get).toHaveBeenCalledWith('/achievements/ach-3/progress');
      expect(result.percentage).toBe(50);
      expect(result.isCompleted).toBe(false);
    });
  });

  describe('checkAchievementTriggers', () => {
    it('should check and trigger achievements', async () => {
      const mockResponse = {
        data: {
          triggered: [
            {
              id: 'ach-4',
              name: 'Donation Master',
              unlocked: true,
            },
          ],
          progress: [
            {
              achievementId: 'ach-5',
              newProgress: 7,
              requiredCount: 10,
            },
          ],
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await achievementService.checkAchievementTriggers('donation', {
        amount: 5000,
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/achievements/check', {
        action: 'donation',
        metadata: { amount: 5000 },
      });
      expect(result.triggered).toHaveLength(1);
      expect(result.progress).toHaveLength(1);
    });
  });
});
