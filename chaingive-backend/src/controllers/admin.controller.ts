import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendKYCApprovalEmail } from '../services/email.service';
import { sendKYCApprovalSMS } from '../services/sms.service';

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      tier, 
      kycStatus, 
      isActive, 
      isBanned,
      city,
      search 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (tier) where.tier = Number(tier);
    if (kycStatus) where.kycStatus = kycStatus;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isBanned !== undefined) where.isBanned = isBanned === 'true';
    if (city) where.locationCity = city;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phoneNumber: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tier: true,
          trustScore: true,
          totalCyclesCompleted: true,
          totalDonated: true,
          totalReceived: true,
          charityCoinsBalance: true,
          kycStatus: true,
          isActive: true,
          isBanned: true,
          locationCity: true,
          locationState: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details with full activity history
 */
export const getUserDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        cycles: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        sentTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        receivedTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        kycRecords: true,
        agent: true,
        leaderboard: true,
        referralsGiven: {
          include: {
            referredUser: {
              select: {
                firstName: true,
                lastName: true,
                totalCyclesCompleted: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ban a user
 */
export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        isActive: false,
        banReason: reason,
      },
    });

    logger.warn(`User ${userId} banned by admin ${req.user!.id}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
      data: {
        userId: user.id,
        isBanned: user.isBanned,
        banReason: user.banReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        isActive: true,
        banReason: null,
      },
    });

    logger.info(`User ${userId} unbanned by admin ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      data: {
        userId: user.id,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume,
      pendingEscrows,
      completedCycles,
      pendingKYC,
      totalAgents,
      totalCoinsInCirculation,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['completed', 'in_transit'] } },
      }),
      prisma.escrow.aggregate({
        _sum: { amount: true },
        where: { status: 'holding' },
      }),
      prisma.cycle.count({ where: { status: 'fulfilled' } }),
      prisma.kycRecord.count({ where: { status: 'pending' } }),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.user.aggregate({
        _sum: { charityCoinsBalance: true },
      }),
    ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsers, todayTransactions, todayVolume] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: today },
          status: { in: ['completed', 'in_transit'] },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalVolume: Number(totalVolume._sum.amount || 0),
          pendingEscrows: Number(pendingEscrows._sum.amount || 0),
          completedCycles,
          totalAgents,
          totalCoinsInCirculation: totalCoinsInCirculation._sum.charityCoinsBalance || 0,
        },
        today: {
          newUsers: todayUsers,
          transactions: todayTransactions,
          volume: Number(todayVolume._sum.amount || 0),
        },
        pending: {
          kycVerifications: pendingKYC,
          escrowAmount: Number(pendingEscrows._sum.amount || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suspicious transactions
 */
export const getSuspiciousTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50 } = req.query;

    // Criteria for suspicious transactions:
    // - Large amounts (>₦50,000)
    // - Failed status
    // - Users with low trust score (<3.0)
    const suspicious = await prisma.transaction.findMany({
      where: {
        OR: [
          { amount: { gte: 50000 } },
          { status: 'failed' },
          {
            fromUser: {
              trustScore: { lt: 3.0 },
            },
          },
        ],
      },
      take: Number(limit),
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        transactions: suspicious,
        total: suspicious.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending KYC verifications
 */
export const getPendingKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50 } = req.query;

    const pending = await prisma.kycRecord.findMany({
      where: { status: 'pending' },
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            tier: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: {
        kycRecords: pending,
        total: pending.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve KYC verification
 */
export const approveKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { kycId } = req.params;
    const adminId = req.user!.id;

    const kycRecord = await prisma.kycRecord.update({
      where: { id: kycId },
      data: {
        status: 'approved',
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Update user tier based on verification type
    if (kycRecord.verificationType === 'bvn' || kycRecord.verificationType === 'nin') {
      await prisma.user.update({
        where: { id: kycRecord.userId },
        data: {
          tier: 2,
          kycStatus: 'approved',
        },
      });
    }

    logger.info(`KYC ${kycId} approved by admin ${adminId} for user ${kycRecord.userId}`);

    // Send approval email
    if (kycRecord.user.email) {
      await sendKYCApprovalEmail(
        kycRecord.user.email,
        kycRecord.user.firstName,
        kycRecord.verificationType
      );
    }

    // Send SMS notification
    await sendKYCApprovalSMS(
      kycRecord.user.phoneNumber,
      kycRecord.user.firstName,
      kycRecord.verificationType
    );

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      data: kycRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject KYC verification
 */
export const rejectKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { kycId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const kycRecord = await prisma.kycRecord.update({
      where: { id: kycId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    logger.info(`KYC ${kycId} rejected by admin ${adminId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'KYC rejected',
      data: kycRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [coinSales, redemptions, transactionFees] = await Promise.all([
      // Coin sales revenue
      prisma.coinSaleToUser.aggregate({
        _sum: { totalPrice: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      // Marketplace redemptions
      prisma.redemption.aggregate({
        _sum: { coinsSpent: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
          status: 'approved',
        },
      }),
      // Transaction fees (2%)
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
          status: 'completed',
        },
      }),
    ]);

    const totalTransactionVolume = Number(transactionFees._sum.amount || 0);
    const estimatedFees = totalTransactionVolume * 0.02; // 2% fee

    const totalRevenue = 
      Number(coinSales._sum.totalPrice || 0) +
      estimatedFees;

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        revenue: {
          coinSales: Number(coinSales._sum.totalPrice || 0),
          transactionFees: estimatedFees,
          total: totalRevenue,
        },
        metrics: {
          coinsSold: coinSales._count,
          itemsRedeemed: redemptions._count,
          transactionsProcessed: transactionFees._count,
          totalVolume: totalTransactionVolume,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user growth metrics
 */
export const getUserGrowthReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [newUsers, activeUsers, retentionData] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate },
          isActive: true,
        },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          createdAt: true,
          lastLoginAt: true,
        },
      }),
    ]);

    // Calculate retention rate
    const retainedUsers = retentionData.filter(u => 
      u.lastLoginAt && u.lastLoginAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const retentionRate = newUsers > 0 ? (retainedUsers / newUsers) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        newUsers,
        activeUsers,
        retentionRate: retentionRate.toFixed(2),
        dailyAverage: (newUsers / days).toFixed(1),
      },
    });
  } catch (error) {
    next(error);
  }
};
