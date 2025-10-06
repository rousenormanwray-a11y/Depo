import Joi from 'joi';

export const verifyUserSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
  verificationType: Joi.string().valid('bvn', 'nin', 'agent', 'selfie').required(),
  verificationData: Joi.object().optional(),
});

export const cashDepositSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
  amount: Joi.number().min(100).max(1000000).required(),
});
