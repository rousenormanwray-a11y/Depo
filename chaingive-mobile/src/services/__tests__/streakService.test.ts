import streakService from '../streakService';
import apiClient from '../api';

jest.mock('../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('streakService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentStreak', () => {
    it('should fetch current streak', async () => {
      const mockResponse = {
        data: {
          userId: 'user-1',
          currentStreak: 7,
          longestStreak: 15,
          lastActivityDate: '2025-10-06T00:00:00Z',
          streakType: 'login',
          milestones: [],
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await streakService.getCurrentStreak();

      expect(mockApiClient.get).toHaveBeenCalledWith('/streaks/current');
      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(15);
    });
  });

  describe('updateLoginStreak', () => {
    it('should update login streak successfully', async () => {
      const mockResponse = {
        data: {
          currentStreak: 8,
          longestStreak: 15,
          isNewRecord: false,
          reward: { xp: 10, coins: 5 },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await streakService.updateLoginStreak();

      expect(mockApiClient.post).toHaveBeenCalledWith('/streaks/login');
      expect(result.currentStreak).toBe(8);
      expect(result.reward).toBeDefined();
    });

    it('should handle new record streak', async () => {
      const mockResponse = {
        data: {
          currentStreak: 16,
          longestStreak: 16,
          isNewRecord: true,
          reward: { xp: 50, coins: 25 },
          milestoneReached: {
            days: 16,
            reward: { badge: '16 Day Streak' },
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await streakService.updateLoginStreak();

      expect(result.isNewRecord).toBe(true);
      expect(result.milestoneReached).toBeDefined();
    });
  });

  describe('getStreakCalendar', () => {
    it('should fetch streak calendar for a month', async () => {
      const mockResponse = {
        data: [
          {
            date: '2025-10-01',
            hasActivity: true,
            activityType: 'login',
            isPartOfStreak: true,
          },
          {
            date: '2025-10-02',
            hasActivity: false,
            isPartOfStreak: false,
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await streakService.getStreakCalendar(10, 2025);

      expect(mockApiClient.get).toHaveBeenCalledWith('/streaks/calendar', {
        params: { month: 10, year: 2025 },
      });
      expect(result).toHaveLength(2);
      expect(result[0].hasActivity).toBe(true);
    });
  });

  describe('checkStreakStatus', () => {
    it('should check if streak is about to break', async () => {
      const mockResponse = {
        data: {
          isActive: true,
          willBreakIn: 12,
          shouldRemind: true,
          currentStreak: 7,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await streakService.checkStreakStatus();

      expect(mockApiClient.get).toHaveBeenCalledWith('/streaks/status');
      expect(result.shouldRemind).toBe(true);
      expect(result.willBreakIn).toBe(12);
    });
  });
});
