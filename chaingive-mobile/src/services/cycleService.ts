import { apiClient, handleApiError } from './api';

export interface Cycle {
  id: string;
  userId: string;
  donationId: string;
  type: 'GIVE' | 'RECEIVE';
  amount: number;
  status: 'PENDING' | 'FULFILLED' | 'DEFAULTED';
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  donation?: {
    id: string;
    donorId: string;
    recipientId: string;
    amount: number;
    status: string;
    confirmedAt?: string;
    donor?: {
      firstName: string;
      lastName: string;
      trustScore: number;
    };
    recipient?: {
      firstName: string;
      lastName: string;
      trustScore: number;
    };
  };
}

/**
 * Cycle Service
 * Handles all cycle-related API calls
 */
class CycleService {
  /**
   * Get user's cycles
   */
  async getCycles(status?: 'PENDING' | 'FULFILLED' | 'DEFAULTED'): Promise<{
    cycles: Cycle[];
    total: number;
  }> {
    try {
      const response = await apiClient.get('/cycles', {
        params: status ? { status } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get cycle by ID
   */
  async getCycleById(id: string): Promise<Cycle> {
    try {
      const response = await apiClient.get<Cycle>(`/cycles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const cycleService = new CycleService();
export default cycleService;
