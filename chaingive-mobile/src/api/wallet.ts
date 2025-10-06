import { apiClient } from './client';

export const walletAPI = {
  getBalance: () => apiClient.get('/wallet/balance'),
  getTransactions: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/wallet/transactions', { params }),
  getTransaction: (id: string) => apiClient.get(`/wallet/transactions/${id}`),
  deposit: (payload: { amount: number; method: string }) =>
    apiClient.post('/wallet/deposit', payload),
  withdraw: (payload: { amount: number; bankCode: string; accountNumber: string }) =>
    apiClient.post('/wallet/withdraw', payload),
};
