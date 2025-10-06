import { Router } from 'express';
import * as coinPurchaseController from '../controllers/coinPurchase.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * User Endpoints
 */

// Get available agents
router.get(
  '/agents/available',
  coinPurchaseController.getAvailableAgents
);

// Request coin purchase (creates escrow)
router.post(
  '/request',
  validate(Joi.object({
    agentId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(10).max(10000).required(),
  })),
  coinPurchaseController.requestCoinPurchase
);

// Confirm payment sent
router.post(
  '/:transactionId/confirm-payment',
  validate(Joi.object({
    paymentMethod: Joi.string().valid('bank_transfer', 'mobile_money', 'cash').required(),
    paymentProof: Joi.string().uri().optional(),
  })),
  coinPurchaseController.confirmPaymentSent
);

// Get purchase history
router.get(
  '/my-purchases',
  coinPurchaseController.getUserPurchaseHistory
);

/**
 * Agent Endpoints
 */

// Get pending confirmations
router.get(
  '/agent/pending',
  requireRole('agent', 'power_partner', 'csc_council'),
  coinPurchaseController.getAgentPendingConfirmations
);

// Confirm payment received (release coins)
router.post(
  '/agent/:transactionId/confirm',
  requireRole('agent', 'power_partner', 'csc_council'),
  coinPurchaseController.agentConfirmPayment
);

// Reject payment (cancel and return coins)
router.post(
  '/agent/:transactionId/reject',
  requireRole('agent', 'power_partner', 'csc_council'),
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  coinPurchaseController.agentRejectPayment
);

export default router;
