import Joi from 'joi';

export const createDisputeSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
  category: Joi.string()
    .valid('non_receipt', 'wrong_amount', 'fraud', 'other')
    .required(),
  description: Joi.string().min(20).max(1000).required().messages({
    'string.min': 'Description must be at least 20 characters',
    'string.max': 'Description cannot exceed 1000 characters',
  }),
});

export const addMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
});

export const uploadEvidenceSchema = Joi.object({
  fileUrl: Joi.string().uri().required(),
  fileType: Joi.string().valid('image', 'pdf', 'screenshot').required(),
  description: Joi.string().max(500).optional(),
});

export const assignDisputeSchema = Joi.object({
  mediatorId: Joi.string().uuid().required(),
});

export const resolveDisputeSchema = Joi.object({
  resolution: Joi.string().min(20).max(1000).required(),
  resolutionType: Joi.string()
    .valid('refund', 'no_action', 'partial_refund')
    .required(),
});
