import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Get user's cycles
 */
export const getCycles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [cycles, total] = await Promise.all([
      prisma.cycle.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cycle.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cycles,
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
 * Get cycle by ID
 */
export const getCycleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const cycle = await prisma.cycle.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!cycle) {
      throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: cycle,
    });
  } catch (error) {
    next(error);
  }
};
