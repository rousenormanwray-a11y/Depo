import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get wallet balance
 */
export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { charityCoinsBalance: true },
    });

    res.status(200).json({
      success: true,
      data: {
        fiatBalance: wallet.fiatBalance,
        receivableBalance: wallet.receivableBalance,
        pendingObligations: wallet.pendingObligations,
        charityCoins: user?.charityCoinsBalance || 0,
        totalInflows: wallet.totalInflows,
        totalOutflows: wallet.totalOutflows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction history
 */
export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, offset = 0, type, status } = req.query;

    const where: any = {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          toUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        escrows: true,
        blockchainLog: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate deposit
 */
export const initiateDeposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { amount, paymentMethod, paymentProofUrl } = req.body;

    // Generate transaction reference
    const transactionRef = generateTransactionRef();

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionRef,
        type: 'deposit',
        toUserId: userId,
        amount,
        fee: 0,
        netAmount: amount,
        status: 'pending',
        paymentMethod,
        metadata: paymentProofUrl ? { paymentProofUrl } : undefined,
      },
    });

    logger.info(`Deposit initiated: ${transaction.id}`);

    // For bank transfer, provide payment instructions
    let paymentInstructions = null;
    if (paymentMethod === 'bank_transfer') {
      paymentInstructions = {
        bankName: 'First Bank',
        accountNumber: '1234567890',
        accountName: 'ChainGive Escrow',
        reference: transactionRef,
      };
    }

    res.status(201).json({
      success: true,
      data: {
        transactionRef,
        amount,
        status: 'pending',
        paymentInstructions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate withdrawal
 */
export const initiateWithdrawal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { amount, bankCode, accountNumber, accountName } = req.body;

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND');
    }

    // Check balance
    if (wallet.fiatBalance < amount) {
      throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE', {
        required: amount,
        available: wallet.fiatBalance,
      });
    }

    // Calculate fee (₦50)
    const fee = 50;
    const netAmount = amount - fee;

    // Generate transaction reference
    const transactionRef = generateTransactionRef();

    // Create transaction and update wallet in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          transactionRef,
          type: 'withdrawal',
          fromUserId: userId,
          amount,
          fee,
          netAmount,
          status: 'processing',
          paymentMethod: 'bank_transfer',
          metadata: {
            bankCode,
            accountNumber,
            accountName,
          },
        },
      }),
      prisma.wallet.update({
        where: { userId },
        data: {
          fiatBalance: { decrement: amount },
          totalOutflows: { increment: amount },
        },
      }),
    ]);

    logger.info(`Withdrawal initiated: ${transaction.id}`);

    res.status(201).json({
      success: true,
      data: {
        transactionRef,
        amount,
        fee,
        netAmount,
        status: 'processing',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm deposit (called by webhook or admin)
 */
export const confirmDeposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionRef, providerRef } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { transactionRef },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.status !== 'pending') {
      throw new AppError('Transaction already processed', 400, 'ALREADY_PROCESSED');
    }

    // Update transaction and wallet
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          paymentProviderRef: providerRef,
          completedAt: new Date(),
        },
      }),
      prisma.wallet.update({
        where: { userId: transaction.toUserId! },
        data: {
          fiatBalance: { increment: transaction.amount },
          totalInflows: { increment: transaction.amount },
        },
      }),
    ]);

    logger.info(`Deposit confirmed: ${transaction.id}`);

    res.status(200).json({
      success: true,
      message: 'Deposit confirmed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
function generateTransactionRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TXN-${dateStr}-${random}`;
}
