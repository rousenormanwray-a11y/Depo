import { apiClient } from './client';

export const agentAPI = {
  // Get agent dashboard data
  getDashboard: () => {
    return apiClient.get('/agents/dashboard');
  },

  // Get agent stats
  getStats: () => {
    return apiClient.get('/agents/me/stats');
  },

  // Get pending verification requests
  getPendingVerifications: () => {
    return apiClient.get('/agents/verifications/pending');
  },

  // Get all verifications (for history)
  getAllVerifications: (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/agents/verifications', { params });
  },

  // Process verification request
  processVerification: (data: {
    requestId: string;
    status: 'approved' | 'rejected';
    notes?: string;
  }) => {
    return apiClient.post(`/agents/verifications/${data.requestId}/process`, {
      status: data.status,
      notes: data.notes,
    });
  },

  // Log cash deposit
  logCashDeposit: (data: {
    userId: string;
    amount: number;
    phoneNumber: string;
    notes?: string;
  }) => {
    return apiClient.post('/agents/cash-deposits', data);
  },

  // Update agent location
  updateLocation: (data: {
    state: string;
    city: string;
    address: string;
  }) => {
    return apiClient.patch('/agents/me/location', data);
  },

  // Update agent status (active/inactive)
  updateStatus: (isActive: boolean) => {
    return apiClient.patch('/agents/me/status', { isActive });
  },

  // Get coin inventory (for P2P coin sales)
  getCoinInventory: () => {
    return apiClient.get('/agents/coins/inventory');
  },

  // Request coin purchase from admin
  requestCoins: (data: {
    quantity: number;
    cryptoType: 'BTC' | 'USDT' | 'ETH';
    txHash: string;
  }) => {
    return apiClient.post('/agents/coins/purchase', data);
  },

  // Get pending coin sale requests from users
  getPendingCoinSales: () => {
    return apiClient.get('/agents/coins/sales/pending');
  },

  // Confirm user payment for coin purchase
  confirmCoinSale: (data: {
    transactionId: string;
  }) => {
    return apiClient.post(`/agents/coins/sales/${data.transactionId}/confirm`);
  },

  // Reject user payment for coin purchase
  rejectCoinSale: (data: {
    transactionId: string;
    reason: string;
  }) => {
    return apiClient.post(`/agents/coins/sales/${data.transactionId}/reject`, {
      reason: data.reason,
    });
  },
};
