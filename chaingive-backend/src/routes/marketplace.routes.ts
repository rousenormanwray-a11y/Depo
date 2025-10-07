import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplace.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as marketplaceValidation from '../validations/marketplace.validation';

const router = Router();

/**
 * @route   GET /v1/marketplace/listings
 * @desc    Get marketplace listings
 * @access  Public
 */
router.get('/listings', marketplaceController.getListings);

/**
 * @route   GET /v1/marketplace/listings/:id
 * @desc    Get listing details
 * @access  Public
 */
router.get('/listings/:id', marketplaceController.getListingById);

// Protected routes
router.use(authenticate);

/**
 * @route   POST /v1/marketplace/redeem
 * @desc    Redeem Charity Coins
 * @access  Private
 */
router.post('/redeem', validate(marketplaceValidation.redeemSchema), marketplaceController.redeemItem);

/**
 * @route   GET /v1/marketplace/redemptions
 * @desc    Get user's redemption history
 * @access  Private
 */
router.get('/redemptions', marketplaceController.getRedemptions);

export default router;
