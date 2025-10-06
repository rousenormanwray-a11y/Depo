import { apiClient, handleApiError } from './api';

export interface WalletBalance {
  balance: number;
  charityCoins: number;
  totalDonated: number;
  totalReceived: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'DONATION_SENT' | 'DONATION_RECEIVED' | 'REDEMPTION';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  reference?: string;
  createdAt: string;
  metadata?: any;
}

export interface AgentCoinPurchaseRequest {
  agentId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
}

export interface AgentCoinPurchase {
  id: string;
  userId: string;
  agentId: string;
  amount: number;
  status: 'PENDING' | 'ESCROW_LOCKED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  agentConfirmedAt?: string;
  createdAt: string;
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: string;
  };
}

export interface WithdrawData {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

/**
 * Wallet Service
 * Handles all wallet-related API calls
 */
class WalletService {
  /**
   * Get wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    try {
      const response = await apiClient.get<WalletBalance>('/wallet/balance');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(page = 1, limit = 20): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get('/wallet/transactions', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get<Transaction>(`/wallet/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request to buy coins from agent
   * This locks the agent's coins in escrow
   */
  async requestAgentCoinPurchase(data: AgentCoinPurchaseRequest): Promise<{
    purchase: AgentCoinPurchase;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/wallet/agent-purchase/request', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get pending agent coin purchases (for user)
   */
  async getPendingAgentPurchases(): Promise<{
    purchases: AgentCoinPurchase[];
  }> {
    try {
      const response = await apiClient.get('/wallet/agent-purchase/pending');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel agent coin purchase request (user side)
   */
  async cancelAgentPurchase(purchaseId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.post(`/wallet/agent-purchase/${purchaseId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Initiate withdrawal
   */
  async initiateWithdrawal(data: WithdrawData): Promise<{
    transaction: Transaction;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/wallet/withdraw', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const walletService = new WalletService();
export default walletService;
