import { Router } from 'express';
import * as cycleController from '../controllers/cycle.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/cycles
 * @desc    Get user's cycles
 * @access  Private
 */
router.get('/', cycleController.getCycles);

/**
 * @route   GET /v1/cycles/:id
 * @desc    Get cycle details
 * @access  Private
 */
router.get('/:id', cycleController.getCycleById);

export default router;
