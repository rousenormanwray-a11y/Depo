import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as userValidation from '../validations/user.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', userController.getProfile);

/**
 * @route   PATCH /v1/users/me
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/me', validate(userValidation.updateProfileSchema), userController.updateProfile);

/**
 * @route   GET /v1/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', userController.getStats);

export default router;
