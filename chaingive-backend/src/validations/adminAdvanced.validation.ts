import Joi from 'joi';

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid('beginner', 'agent', 'power_partner', 'csc_council')
    .required(),
});

export const sendCoinsSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  amount: Joi.number().integer().min(1).max(100000).required().messages({
    'number.min': 'Minimum is 1 coin',
    'number.max': 'Maximum is 100,000 coins per transaction',
  }),
  reason: Joi.string().min(5).max(500).required(),
});

export const sendBulkEmailSchema = Joi.object({
  subject: Joi.string().min(5).max(200).required(),
  body: Joi.string().min(10).max(10000).required(),
  filters: Joi.object({
    role: Joi.string()
      .valid('beginner', 'agent', 'power_partner', 'csc_council')
      .optional(),
    tier: Joi.number().integer().min(1).max(3).optional(),
    city: Joi.string().optional(),
    kycStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  }).optional(),
});

export const sendSingleEmailSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  subject: Joi.string().min(5).max(200).required(),
  body: Joi.string().min(10).max(10000).required(),
});

export const toggleFeatureFlagSchema = Joi.object({
  featureName: Joi.string().required(),
  isEnabled: Joi.boolean().required(),
});
