import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate, requireTier } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * @route   POST /v1/upload/payment-proof
 * @desc    Upload payment proof
 * @access  Private
 */
router.post(
  '/payment-proof',
  uploadSingle('file'),
  uploadController.uploadPaymentProof
);

/**
 * @route   POST /v1/upload/kyc
 * @desc    Upload KYC document (ID card, passport, selfie, utility bill)
 * @access  Private
 */
router.post(
  '/kyc',
  uploadSingle('file'),
  uploadController.uploadKYCDocument
);

/**
 * @route   POST /v1/upload/profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post(
  '/profile-picture',
  uploadSingle('file'),
  uploadController.uploadProfilePicture
);

/**
 * @route   POST /v1/upload/marketplace-image
 * @desc    Upload marketplace item image
 * @access  Private (Tier 2+)
 */
router.post(
  '/marketplace-image',
  requireTier(2),
  uploadSingle('file'),
  uploadController.uploadMarketplaceImage
);

/**
 * @route   POST /v1/upload/multiple
 * @desc    Upload multiple files (max 5)
 * @access  Private
 */
router.post(
  '/multiple',
  uploadMultiple('files', 5),
  uploadController.uploadMultipleFiles
);

export default router;
