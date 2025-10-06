import { apiClient } from './client';

export const referralAPI = {
  // Get my referral code and stats
  getMyCode: () => {
    return apiClient.get('/referrals/my-code');
  },

  // Get referral history
  getHistory: () => {
    return apiClient.get('/referrals/history');
  },
};
