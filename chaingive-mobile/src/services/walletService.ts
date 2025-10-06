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

export interface DepositData {
  amount: number;
  paymentMethod: 'FLUTTERWAVE' | 'PAYSTACK' | 'OPAY' | 'PALMPAY' | 'BANK_TRANSFER';
  paymentProof?: string;
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
   * Initiate deposit
   */
  async initiateDeposit(data: DepositData): Promise<{
    transaction: Transaction;
    paymentUrl?: string;
    reference: string;
  }> {
    try {
      const response = await apiClient.post('/wallet/deposit', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Confirm deposit (after payment)
   */
  async confirmDeposit(reference: string): Promise<{
    success: boolean;
    transaction: Transaction;
  }> {
    try {
      const response = await apiClient.post('/wallet/deposit/confirm', { reference });
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
