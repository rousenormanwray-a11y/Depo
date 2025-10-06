import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * User Endpoints
 */

// Create dispute
router.post(
  '/create',
  validate(Joi.object({
    transactionId: Joi.string().uuid().required(),
    category: Joi.string().valid('non_receipt', 'wrong_amount', 'fraud', 'other').required(),
    description: Joi.string().min(20).max(1000).required(),
  })),
  disputeController.createDispute
);

// Get my disputes
router.get(
  '/my-disputes',
  disputeController.getMyDisputes
);

// Get dispute details
router.get(
  '/:disputeId',
  disputeController.getDisputeDetails
);

// Add message to dispute
router.post(
  '/:disputeId/message',
  validate(Joi.object({
    message: Joi.string().min(1).max(1000).required(),
  })),
  disputeController.addDisputeMessage
);

// Upload evidence
router.post(
  '/:disputeId/evidence',
  validate(Joi.object({
    fileUrl: Joi.string().uri().required(),
    fileType: Joi.string().valid('image', 'pdf', 'screenshot').required(),
    description: Joi.string().max(500).optional(),
  })),
  disputeController.uploadDisputeEvidence
);

/**
 * Admin Endpoints
 */

// Get all disputes
router.get(
  '/admin/all',
  requireRole('csc_council', 'agent'),
  disputeController.getAllDisputes
);

// Assign dispute to mediator
router.post(
  '/:disputeId/assign',
  requireRole('csc_council', 'agent'),
  validate(Joi.object({
    mediatorId: Joi.string().uuid().required(),
  })),
  disputeController.assignDispute
);

// Resolve dispute
router.post(
  '/:disputeId/resolve',
  requireRole('csc_council', 'agent'),
  validate(Joi.object({
    resolution: Joi.string().min(20).max(1000).required(),
    resolutionType: Joi.string().valid('refund', 'no_action', 'partial_refund').required(),
  })),
  disputeController.resolveDispute
);

export default router;
