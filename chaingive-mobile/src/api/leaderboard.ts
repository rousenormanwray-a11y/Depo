import { apiClient } from './client';

export const leaderboardAPI = {
  // Get global leaderboard
  getGlobal: (params?: { limit?: number; offset?: number }) => {
    return apiClient.get('/leaderboard', { params });
  },

  // Get city leaderboard
  getByCity: (city: string, params?: { limit?: number; offset?: number }) => {
    return apiClient.get(`/leaderboard/city/${city}`, { params });
  },

  // Get user's rank
  getMyRank: () => {
    return apiClient.get('/leaderboard/me');
  },

  // Boost leaderboard position
  boostPosition: (data: {
    boostType: 'visibility' | 'multiplier' | 'position';
    coinsToSpend: number;
    duration?: number;
  }) => {
    return apiClient.post('/leaderboard/boost', data);
  },
};
