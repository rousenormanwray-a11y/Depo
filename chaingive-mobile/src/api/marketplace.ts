import { apiClient } from './client';

export const marketplaceAPI = {
  getListings: (params?: { category?: string; page?: number; limit?: number; q?: string }) =>
    apiClient.get('/marketplace/listings', { params }),
  getItem: (id: string) => apiClient.get(`/marketplace/listings/${id}`),
  redeem: (payload: { listingId: string; quantity: number; deliveryInfo: any }) =>
    apiClient.post('/marketplace/redeem', payload),
  getRedemptions: () => apiClient.get('/marketplace/redemptions'),
};
