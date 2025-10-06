import Joi from 'joi';

export const requestPurchaseSchema = Joi.object({
  agentId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(10).max(10000).required().messages({
    'number.min': 'Minimum purchase is 10 coins',
    'number.max': 'Maximum purchase is 10,000 coins',
  }),
});

export const confirmPaymentSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid('bank_transfer', 'mobile_money', 'cash')
    .required(),
  paymentProof: Joi.string().uri().optional(),
});

export const rejectPaymentSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Reason must be at least 10 characters',
    'string.max': 'Reason must be less than 500 characters',
  }),
});
