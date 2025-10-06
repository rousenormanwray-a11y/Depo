import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as donationValidation from '../validations/donation.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /v1/donations/give
 * @desc    Initiate a donation
 * @access  Private
 */
router.post('/give', validate(donationValidation.giveSchema), donationController.giveDonation);

/**
 * @route   POST /v1/donations/confirm-receipt
 * @desc    Confirm receipt of donation
 * @access  Private
 */
router.post('/confirm-receipt', validate(donationValidation.confirmReceiptSchema), donationController.confirmReceipt);

export default router;
