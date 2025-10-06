import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Get pending matches for user
 */
export const getPendingMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const matches = await prisma.match.findMany({
      where: {
        recipientId: userId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            locationCity: true,
            trustScore: true,
          },
        },
      },
      orderBy: { matchedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { matches },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a match
 */
export const acceptMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const match = await prisma.match.findFirst({
      where: {
        id,
        recipientId: userId,
        status: 'pending',
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404, 'MATCH_NOT_FOUND');
    }

    if (match.expiresAt && new Date() > match.expiresAt) {
      throw new AppError('Match has expired', 400, 'MATCH_EXPIRED');
    }

    await prisma.match.update({
      where: { id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Match accepted. Awaiting donor transfer.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a match
 */
export const rejectMatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { reason } = req.body;

    const match = await prisma.match.findFirst({
      where: {
        id,
        recipientId: userId,
        status: 'pending',
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404, 'MATCH_NOT_FOUND');
    }

    await prisma.match.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Match rejected',
    });
  } catch (error) {
    next(error);
  }
};
