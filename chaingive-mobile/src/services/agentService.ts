import { apiClient, handleApiError } from './api';

export interface AgentDashboard {
  stats: {
    totalVerifications: number;
    pendingVerifications: number;
    totalDeposits: number;
    totalCommissions: number;
    rating: number;
    rank: string;
  };
  recentActivity: Array<{
    id: string;
    type: 'VERIFICATION' | 'DEPOSIT';
    description: string;
    amount?: number;
    commission?: number;
    createdAt: string;
  }>;
}

export interface VerifyUserData {
  phoneNumber: string;
  verificationType: 'BVN' | 'NIN' | 'SELFIE';
  verificationData: {
    bvn?: string;
    nin?: string;
    selfieUrl?: string;
    documentUrls?: string[];
  };
}

export interface PendingCoinPurchase {
  id: string;
  userId: string;
  agentId: string;
  amount: number;
  status: 'PENDING' | 'ESCROW_LOCKED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export interface ConfirmPaymentData {
  purchaseId: string;
  paymentReceived: boolean;
  notes?: string;
}

/**
 * Agent Service
 * Handles all agent-related API calls
 */
class AgentService {
  /**
   * Get agent dashboard stats
   */
  async getDashboard(): Promise<AgentDashboard> {
    try {
      const response = await apiClient.get<AgentDashboard>('/agents/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify a user (KYC)
   */
  async verifyUser(data: VerifyUserData): Promise<{
    success: boolean;
    message: string;
    commission: number;
  }> {
    try {
      const response = await apiClient.post('/agents/verify-user', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get pending coin purchase requests (agent side)
   */
  async getPendingCoinRequests(): Promise<{
    purchases: PendingCoinPurchase[];
  }> {
    try {
      const response = await apiClient.get('/agents/coin-requests/pending');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Confirm payment received and release coins to user
   */
  async confirmPaymentAndRelease(data: ConfirmPaymentData): Promise<{
    success: boolean;
    purchase: PendingCoinPurchase;
    commission: number;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/agents/coin-requests/confirm', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reject coin purchase (if payment not received)
   */
  async rejectCoinPurchase(purchaseId: string, reason: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.post(`/agents/coin-requests/${purchaseId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const agentService = new AgentService();
export default agentService;
