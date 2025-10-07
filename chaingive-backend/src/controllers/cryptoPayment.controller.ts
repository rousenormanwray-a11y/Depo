import { Request, Response } from 'express';
import * as cryptoPaymentService from '../services/cryptoPayment.service';
import { AuthRequest } from '../middleware/auth';

/**
 * ============================================
 * ADMIN - BTCPAY CONFIGURATION
 * ============================================
 */

export const getBTCPayConfig = async (req: Request, res: Response) => {
  try {
    const config = await cryptoPaymentService.getBTCPayConfig();
    
    // Don't send API key to frontend
    if (config) {
      const { btcpayApiKey, ...safeConfig } = config as any;
      res.json({ btcpayApiKey: '***************', ...safeConfig });
    } else {
      res.json(null);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveBTCPayConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await cryptoPaymentService.saveBTCPayConfig(req.body);
    res.json(config);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBTCPayConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await cryptoPaymentService.updateBTCPayConfig(req.body);
    res.json(config);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const testBTCPayConnection = async (req: AuthRequest, res: Response) => {
  try {
    const result = await cryptoPaymentService.testBTCPayConnection();
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteBTCPayConfig = async (req: AuthRequest, res: Response) => {
  try {
    await cryptoPaymentService.deleteBTCPayConfig();
    res.json({ message: 'BTCPay configuration deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ============================================
 * ADMIN - CRYPTO COINS MANAGEMENT
 * ============================================
 */

export const getCryptoCoins = async (req: Request, res: Response) => {
  try {
    const coins = await cryptoPaymentService.getCryptoCoins();
    res.json(coins);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addCryptoCoin = async (req: AuthRequest, res: Response) => {
  try {
    const coin = await cryptoPaymentService.addCryptoCoin(req.body);
    res.json(coin);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCryptoCoin = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId } = req.params;
    const coin = await cryptoPaymentService.updateCryptoCoin(coinId, req.body);
    res.json(coin);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleCryptoCoin = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId } = req.params;
    const { isEnabled } = req.body;
    const coin = await cryptoPaymentService.toggleCryptoCoin(coinId, isEnabled);
    res.json(coin);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCryptoCoin = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId } = req.params;
    await cryptoPaymentService.deleteCryptoCoin(coinId);
    res.json({ message: 'Crypto coin deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ============================================
 * ADMIN - PAYMENT MANAGEMENT
 * ============================================
 */

export const getPendingPayments = async (req: Request, res: Response) => {
  try {
    const payments = await cryptoPaymentService.getPendingPayments();
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { status, agentId, coinSymbol, page = '1', limit = '20' } = req.query;
    
    const result = await cryptoPaymentService.getAllPayments({
      status: status as string,
      agentId: agentId as string,
      coinSymbol: coinSymbol as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await cryptoPaymentService.getPaymentDetails(paymentId);
    res.json(payment);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { transactionHash, confirmations, notes } = req.body;
    const adminId = req.user?.id;
    
    const payment = await cryptoPaymentService.confirmPayment(
      paymentId,
      {
        transactionHash,
        confirmations,
        notes,
      },
      adminId!
    );
    
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;
    
    const payment = await cryptoPaymentService.rejectPayment(
      paymentId,
      { reason },
      adminId!
    );
    
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const syncBTCPayPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await cryptoPaymentService.syncBTCPayPayment(paymentId);
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * ============================================
 * ADMIN - BTCPAY INTEGRATION
 * ============================================
 */

export const createBTCPayInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await cryptoPaymentService.createBTCPayInvoice(req.body);
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getBTCPayInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await cryptoPaymentService.getBTCPayInvoice(invoiceId);
    res.json(invoice);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * ============================================
 * ADMIN - STATS & ANALYTICS
 * ============================================
 */

export const getCryptoPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await cryptoPaymentService.getCryptoPaymentStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================================
 * AGENT - CRYPTO PURCHASE
 * ============================================
 */

export const getAvailableCryptoCoins = async (req: Request, res: Response) => {
  try {
    const coins = await cryptoPaymentService.getAvailableCryptoCoins();
    res.json(coins);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const initiateAgentCryptoPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { coinAmount, cryptoCoinId } = req.body;
    const agentId = req.user?.id;
    const agentName = `${req.user?.firstName} ${req.user?.lastName}`;
    
    const payment = await cryptoPaymentService.initiateAgentCryptoPurchase({
      agentId: agentId!,
      agentName,
      coinAmount,
      cryptoCoinId,
    });
    
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAgentCryptoPayments = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const payments = await cryptoPaymentService.getAgentCryptoPayments(agentId!);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
