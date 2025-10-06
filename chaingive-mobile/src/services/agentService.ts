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

export interface CashDepositData {
  phoneNumber: string;
  amount: number;
  paymentMethod: 'CASH';
  receiptUrl?: string;
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
   * Log a cash deposit
   */
  async logCashDeposit(data: CashDepositData): Promise<{
    success: boolean;
    transaction: any;
    commission: number;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/agents/cash-deposit', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const agentService = new AgentService();
export default agentService;
