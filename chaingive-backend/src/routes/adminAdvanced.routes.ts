import { Router } from 'express';
import * as adminAdvancedController from '../controllers/adminAdvanced.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Admin roles

/**
 * User Promotion & Management
 */

// Promote user to agent role
router.post(
  '/users/:userId/promote-to-agent',
  adminAdvancedController.promoteToAgent
);

// Update user role
router.patch(
  '/users/:userId/role',
  validate(Joi.object({
    role: Joi.string().valid('beginner', 'agent', 'power_partner', 'csc_council').required(),
  })),
  adminAdvancedController.updateUserRole
);

// Promote user in match queue (priority matching)
router.post(
  '/users/:userId/promote-match-queue',
  adminAdvancedController.promoteInMatchQueue
);

/**
 * Coin Management
 */

// Send coins to any user/agent
router.post(
  '/coins/send',
  validate(Joi.object({
    userId: Joi.string().uuid().required(),
    amount: Joi.number().integer().min(1).max(100000).required(),
    reason: Joi.string().min(5).max(500).required(),
  })),
  adminAdvancedController.sendCoins
);

/**
 * Email Notifications
 */

// Send bulk email
router.post(
  '/emails/bulk',
  validate(Joi.object({
    subject: Joi.string().min(5).max(200).required(),
    body: Joi.string().min(10).max(10000).required(),
    filters: Joi.object({
      role: Joi.string().valid('beginner', 'agent', 'power_partner', 'csc_council').optional(),
      tier: Joi.number().integer().min(1).max(3).optional(),
      city: Joi.string().optional(),
      kycStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
    }).optional(),
  })),
  adminAdvancedController.sendBulkEmail
);

// Send single email
router.post(
  '/emails/single',
  validate(Joi.object({
    userId: Joi.string().uuid().required(),
    subject: Joi.string().min(5).max(200).required(),
    body: Joi.string().min(10).max(10000).required(),
  })),
  adminAdvancedController.sendSingleEmail
);

/**
 * Feature Flags
 */

// Get all feature flags
router.get(
  '/features',
  adminAdvancedController.getFeatureFlags
);

// Toggle feature flag
router.post(
  '/features/toggle',
  validate(Joi.object({
    featureName: Joi.string().required(),
    isEnabled: Joi.boolean().required(),
  })),
  adminAdvancedController.toggleFeatureFlag
);

/**
 * Admin Action Logs
 */

// Get admin action logs
router.get(
  '/logs',
  adminAdvancedController.getAdminActionLogs
);

export default router;
