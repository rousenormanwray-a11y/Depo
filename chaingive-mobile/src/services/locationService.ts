import { apiClient, handleApiError } from './api';

export interface NearbyAgent {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: {
    city: string;
    state: string;
    address?: string;
  };
  rating: number;
  totalTransactions: number;
  availableCoins: number;
  distance?: number;
  isOnline: boolean;
}

/**
 * Location Service
 * Handles finding nearby agents for coin purchases
 */
class LocationService {
  /**
   * Find nearby agents
   */
  async findNearbyAgents(params?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    radius?: number;
  }): Promise<{
    agents: NearbyAgent[];
    total: number;
  }> {
    try {
      const response = await apiClient.get('/agents/nearby', {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get agent details
   */
  async getAgentDetails(agentId: string): Promise<NearbyAgent> {
    try {
      const response = await apiClient.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const locationService = new LocationService();
export default locationService;
