import Joi from 'joi';

export const depositSchema = Joi.object({
  amount: Joi.number().min(100).max(1000000).required().messages({
    'number.min': 'Minimum deposit amount is ₦100',
    'number.max': 'Maximum deposit amount is ₦1,000,000',
  }),
  paymentMethod: Joi.string()
    .valid('bank_transfer', 'flutterwave', 'paystack', 'opay', 'palmpay')
    .required(),
  paymentProofUrl: Joi.string().uri().optional(),
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().min(500).max(1000000).required().messages({
    'number.min': 'Minimum withdrawal amount is ₦500',
    'number.max': 'Maximum withdrawal amount is ₦1,000,000',
  }),
  bankCode: Joi.string().length(3).required(),
  accountNumber: Joi.string().length(10).pattern(/^\d+$/).required(),
  accountName: Joi.string().min(3).max(100).required(),
});
