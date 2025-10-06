import Joi from 'joi';

export const uploadPaymentProofSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
});

export const uploadKYCDocumentSchema = Joi.object({
  documentType: Joi.string()
    .valid('bvn', 'nin', 'passport', 'drivers_license', 'voters_card')
    .required(),
  documentNumber: Joi.string().optional(),
});

export const uploadProfilePictureSchema = Joi.object({
  // File validation handled by multer middleware
});

export const uploadMarketplaceImageSchema = Joi.object({
  listingId: Joi.string().uuid().optional(),
  title: Joi.string().min(3).max(100).optional(),
});
