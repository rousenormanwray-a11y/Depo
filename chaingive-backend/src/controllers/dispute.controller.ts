import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';
import { sendSMS } from '../services/sms.service';
import { sendEmail } from '../services/email.service';

/**
 * Create a new dispute
 */
export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { transactionId, category, description } = req.body;

    // Verify transaction exists and user is involved
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.fromUserId !== userId && transaction.toUserId !== userId) {
      throw new AppError('You are not authorized to dispute this transaction', 403, 'NOT_AUTHORIZED');
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findFirst({
      where: { transactionId },
    });

    if (existingDispute) {
      throw new AppError('Dispute already exists for this transaction', 400, 'DUPLICATE_DISPUTE');
    }

    // Determine respondent
    const respondentId = transaction.fromUserId === userId ? transaction.toUserId : transaction.fromUserId;

    if (!respondentId) {
      throw new AppError('Cannot create dispute: invalid transaction', 400, 'INVALID_TRANSACTION');
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        transactionId,
        reporterId: userId,
        responderId: respondentId,
        category,
        description,
        status: 'pending',
      },
      include: {
        transaction: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        responder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    logger.info(`Dispute created: ${dispute.id} for transaction ${transactionId}`);

    // Notify respondent
    // Template exists for supported keys only; use email/SMS for now

    await sendSMS(
      dispute.responder.phoneNumber,
      `ChainGive: A dispute has been filed against transaction. Please check app and respond.`
    );

    // Notify admins/CSC members
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['csc_council', 'agent'] },
        isActive: true,
      },
      select: { id: true, email: true, firstName: true },
    });

    for (const admin of admins) {
      if (admin.email) {
        await sendEmail(
          admin.email,
          `New Dispute Filed - ${category}`,
          `<p>Hi ${admin.firstName},</p><p>A new dispute has been filed. Category: ${category}</p><p>Login to admin panel to review.</p>`
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully. Our team will review it shortly.',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's disputes
 */
export const getMyDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { reportedBy: userId },
          { respondent: userId },
        ],
      },
      include: {
        transaction: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        responder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        disputes,
        total: disputes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dispute details
 */
export const getDisputeDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { disputeId } = req.params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        transaction: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
        responder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
        mediator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        evidence: {
          include: {
            uploader: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
    }

    // Verify user is authorized to view
    const isAdmin = req.user!.role === 'csc_council' || req.user!.role === 'agent';
    const isParty = dispute.reportedBy === userId || dispute.respondent === userId;

    if (!isAdmin && !isParty) {
      throw new AppError('Not authorized to view this dispute', 403, 'NOT_AUTHORIZED');
    }

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add message to dispute
 */
export const addDisputeMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { disputeId } = req.params;
    const { message } = req.body;

    // Verify dispute exists and user is authorized
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
    }

    const isAdmin = req.user!.role === 'csc_council' || req.user!.role === 'agent';
    const isParty = dispute.reporterId === userId || dispute.responderId === userId;

    if (!isAdmin && !isParty) {
      throw new AppError('Not authorized to message this dispute', 403, 'NOT_AUTHORIZED');
    }

    const disputeMessage = await prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        message,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    logger.info(`Message added to dispute ${disputeId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: disputeMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload evidence for dispute
 */
export const uploadDisputeEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { disputeId } = req.params;
    const { fileUrl, fileType, description } = req.body;

    // Verify dispute exists and user is authorized
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
    }

    if (dispute.reporterId !== userId && dispute.responderId !== userId) {
      throw new AppError('Not authorized to upload evidence', 403, 'NOT_AUTHORIZED');
    }

    const evidence = await prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploaderId: userId,
        fileUrl,
        fileType,
        description,
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Evidence uploaded to dispute ${disputeId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all disputes (Admin only)
 */
export const getAllDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 50 } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const disputes = await prisma.dispute.findMany({
      where,
      take: Number(limit),
      include: {
        transaction: true,
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        responder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        mediator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            messages: true,
            evidence: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        disputes,
        total: disputes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign dispute to mediator (Admin only)
 */
export const assignDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { disputeId } = req.params;
    const { mediatorId } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        mediatorId,
        status: 'investigating',
      },
      include: {
        mediator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    logger.info(`Dispute ${disputeId} assigned to mediator ${mediatorId}`);

    res.status(200).json({
      success: true,
      message: 'Dispute assigned successfully',
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve dispute (Admin only)
 */
export const resolveDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { disputeId } = req.params;
    const { resolution, resolutionType } = req.body; // resolutionType: refund, no_action, partial_refund
    const adminId = req.user!.id;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new AppError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
    }

    // Handle resolution actions
    if (resolutionType === 'refund') {
      // Issue full refund
      await prisma.$transaction([
        // Update transaction status
        prisma.transaction.update({
          where: { id: dispute.transactionId },
          data: { status: 'refunded' },
        }),
        // Refund donor
        prisma.wallet.update({
          where: { userId: dispute.transaction.fromUserId! },
          data: {
            fiatBalance: { increment: dispute.transaction.amount },
          },
        }),
        // Deduct from recipient if already credited
        prisma.wallet.update({
          where: { userId: dispute.transaction.toUserId! },
          data: {
            fiatBalance: { decrement: dispute.transaction.amount },
          },
        }),
      ]);
    }

    // Update dispute
    const resolvedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'resolved',
        resolution,
        resolutionType,
        mediatorId: adminId,
        resolvedAt: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
          },
        },
        responder: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    logger.info(`Dispute ${disputeId} resolved by admin ${adminId}. Resolution: ${resolutionType}`);

    // Notify both parties
    // Use email/SMS notifications for dispute resolution for now

    // Send email to both parties
    const reporter = await prisma.user.findUnique({
      where: { id: resolvedDispute.reporter.id },
      select: { email: true, phoneNumber: true },
    });

    const responder = await prisma.user.findUnique({
      where: { id: resolvedDispute.responder.id },
      select: { email: true, phoneNumber: true },
    });

    if (reporter?.email) {
      await sendEmail(
        reporter.email,
        'Dispute Resolved',
        `<p>Your dispute has been resolved.</p><p><strong>Resolution:</strong> ${resolution}</p>`
      );
    }

    if (responder?.email) {
      await sendEmail(
        responder.email,
        'Dispute Resolved',
        `<p>The dispute has been resolved.</p><p><strong>Resolution:</strong> ${resolution}</p>`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      data: resolvedDispute,
    });
  } catch (error) {
    next(error);
  }
};
