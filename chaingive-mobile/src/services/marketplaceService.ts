import { apiClient, handleApiError } from './api';

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  category: 'AIRTIME' | 'DATA' | 'UTILITIES' | 'FOOD' | 'OTHER';
  charityCoinsRequired: number;
  stock: number;
  vendor: string;
  imageUrl?: string;
  isActive: boolean;
  metadata?: any;
}

export interface Redemption {
  id: string;
  userId: string;
  listingId: string;
  charityCoinsUsed: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  deliveryInfo?: any;
  voucherCode?: string;
  createdAt: string;
  completedAt?: string;
  listing?: MarketplaceListing;
}

export interface RedeemData {
  listingId: string;
  quantity?: number;
  deliveryInfo?: {
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
}

/**
 * Marketplace Service
 * Handles all marketplace-related API calls
 */
class MarketplaceService {
  /**
   * Get marketplace listings
   */
  async getListings(category?: string): Promise<{
    listings: MarketplaceListing[];
    total: number;
  }> {
    try {
      const response = await apiClient.get('/marketplace/listings', {
        params: category ? { category } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get listing by ID
   */
  async getListingById(id: string): Promise<MarketplaceListing> {
    try {
      const response = await apiClient.get<MarketplaceListing>(`/marketplace/listings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Redeem Charity Coins for a listing
   */
  async redeemItem(data: RedeemData): Promise<{
    redemption: Redemption;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/marketplace/redeem', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's redemption history
   */
  async getRedemptions(): Promise<{
    redemptions: Redemption[];
    total: number;
  }> {
    try {
      const response = await apiClient.get('/marketplace/redemptions');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const marketplaceService = new MarketplaceService();
export default marketplaceService;
