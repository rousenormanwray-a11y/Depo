import apiClient from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CryptoPaymentConfig {
  id: string;
  btcpayServerUrl: string;
  btcpayApiKey: string;
  btcpayStoreId: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  network: string;
  walletAddress: string;
  isEnabled: boolean;
  icon: string;
  minAmount: number;
  maxAmount: number;
  confirmationsRequired: number;
  createdAt: string;
}

export interface CryptoPayment {
  id: string;
  agentId: string;
  agentName: string;
  coinSymbol: string;
  amount: number;
  coinAmount: number;
  cryptoAmount: string;
  walletAddress: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  btcpayInvoiceId?: string;
  confirmations: number;
  createdAt: string;
  confirmedAt?: string;
  expiresAt: string;
}

export interface BTCPayInvoice {
  id: string;
  storeId: string;
  amount: string;
  currency: string;
  status: string;
  checkoutLink: string;
  createdTime: string;
  expirationTime: string;
  monitoringExpiration: string;
  metadata?: any;
}

export interface BTCPayServerConfig {
  serverUrl: string;
  apiKey: string;
  storeId: string;
}

// ============================================================================
// CRYPTO PAYMENT SERVICE
// ============================================================================

class CryptoPaymentService {
  // --------------------------------------------------------------------------
  // BTCPAY CONFIGURATION
  // --------------------------------------------------------------------------

  async getBTCPayConfig(): Promise<CryptoPaymentConfig | null> {
    const response = await apiClient.get('/admin/crypto-payment/config');
    return response.data;
  }

  async saveBTCPayConfig(config: {
    btcpayServerUrl: string;
    btcpayApiKey: string;
    btcpayStoreId: string;
  }): Promise<CryptoPaymentConfig> {
    const response = await apiClient.post('/admin/crypto-payment/config', config);
    return response.data;
  }

  async updateBTCPayConfig(config: Partial<{
    btcpayServerUrl: string;
    btcpayApiKey: string;
    btcpayStoreId: string;
    isEnabled: boolean;
  }>): Promise<CryptoPaymentConfig> {
    const response = await apiClient.patch('/admin/crypto-payment/config', config);
    return response.data;
  }

  async testBTCPayConnection(): Promise<{
    success: boolean;
    message: string;
    storeInfo?: any;
  }> {
    const response = await apiClient.post('/admin/crypto-payment/config/test');
    return response.data;
  }

  async deleteBTCPayConfig(): Promise<void> {
    await apiClient.delete('/admin/crypto-payment/config');
  }

  // --------------------------------------------------------------------------
  // CRYPTO COINS MANAGEMENT
  // --------------------------------------------------------------------------

  async getCryptoCoins(): Promise<CryptoCoin[]> {
    const response = await apiClient.get('/admin/crypto-payment/coins');
    return response.data;
  }

  async addCryptoCoin(coin: {
    symbol: string;
    name: string;
    network: string;
    walletAddress: string;
    minAmount: number;
    maxAmount: number;
    confirmationsRequired: number;
    icon?: string;
  }): Promise<CryptoCoin> {
    const response = await apiClient.post('/admin/crypto-payment/coins', coin);
    return response.data;
  }

  async updateCryptoCoin(
    coinId: string,
    updates: Partial<{
      walletAddress: string;
      isEnabled: boolean;
      minAmount: number;
      maxAmount: number;
      confirmationsRequired: number;
    }>
  ): Promise<CryptoCoin> {
    const response = await apiClient.patch(`/admin/crypto-payment/coins/${coinId}`, updates);
    return response.data;
  }

  async deleteCryptoCoin(coinId: string): Promise<void> {
    await apiClient.delete(`/admin/crypto-payment/coins/${coinId}`);
  }

  async toggleCryptoCoin(coinId: string, isEnabled: boolean): Promise<CryptoCoin> {
    const response = await apiClient.patch(`/admin/crypto-payment/coins/${coinId}/toggle`, {
      isEnabled,
    });
    return response.data;
  }

  // --------------------------------------------------------------------------
  // CRYPTO PAYMENTS
  // --------------------------------------------------------------------------

  async getPendingPayments(): Promise<CryptoPayment[]> {
    const response = await apiClient.get('/admin/crypto-payment/payments/pending');
    return response.data;
  }

  async getAllPayments(filters?: {
    status?: string;
    agentId?: string;
    coinSymbol?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    payments: CryptoPayment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/admin/crypto-payment/payments', {
      params: filters,
    });
    return response.data;
  }

  async getPaymentDetails(paymentId: string): Promise<CryptoPayment & {
    btcpayInvoice?: BTCPayInvoice;
    agent: any;
  }> {
    const response = await apiClient.get(`/admin/crypto-payment/payments/${paymentId}`);
    return response.data;
  }

  async confirmPayment(
    paymentId: string,
    data: {
      transactionHash: string;
      confirmations?: number;
      notes?: string;
    }
  ): Promise<CryptoPayment> {
    const response = await apiClient.post(
      `/admin/crypto-payment/payments/${paymentId}/confirm`,
      data
    );
    return response.data;
  }

  async rejectPayment(
    paymentId: string,
    data: {
      reason: string;
    }
  ): Promise<CryptoPayment> {
    const response = await apiClient.post(
      `/admin/crypto-payment/payments/${paymentId}/reject`,
      data
    );
    return response.data;
  }

  // --------------------------------------------------------------------------
  // BTCPAY INTEGRATION
  // --------------------------------------------------------------------------

  async createBTCPayInvoice(data: {
    amount: number;
    currency: string;
    orderId: string;
    metadata?: any;
  }): Promise<BTCPayInvoice> {
    const response = await apiClient.post('/admin/crypto-payment/btcpay/invoice', data);
    return response.data;
  }

  async getBTCPayInvoice(invoiceId: string): Promise<BTCPayInvoice> {
    const response = await apiClient.get(`/admin/crypto-payment/btcpay/invoice/${invoiceId}`);
    return response.data;
  }

  async syncBTCPayPayment(paymentId: string): Promise<CryptoPayment> {
    const response = await apiClient.post(
      `/admin/crypto-payment/payments/${paymentId}/sync`
    );
    return response.data;
  }

  // --------------------------------------------------------------------------
  // STATS & ANALYTICS
  // --------------------------------------------------------------------------

  async getCryptoPaymentStats(): Promise<{
    totalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;
    totalVolume: number;
    coinBreakdown: Array<{
      symbol: string;
      count: number;
      volume: number;
    }>;
  }> {
    const response = await apiClient.get('/admin/crypto-payment/stats');
    return response.data;
  }

  // --------------------------------------------------------------------------
  // AGENT SIDE (For coin purchase)
  // --------------------------------------------------------------------------

  async getAvailableCryptoCoins(): Promise<CryptoCoin[]> {
    const response = await apiClient.get('/agent/crypto-payment/coins');
    return response.data.filter((coin: CryptoCoin) => coin.isEnabled);
  }

  async initiateAgentCryptoPurchase(data: {
    coinAmount: number;
    cryptoCoinId: string;
  }): Promise<CryptoPayment & { paymentAddress: string; qrCode?: string }> {
    const response = await apiClient.post('/agent/crypto-payment/purchase', data);
    return response.data;
  }

  async getAgentCryptoPayments(): Promise<CryptoPayment[]> {
    const response = await apiClient.get('/agent/crypto-payment/payments');
    return response.data;
  }
}

export default new CryptoPaymentService();
