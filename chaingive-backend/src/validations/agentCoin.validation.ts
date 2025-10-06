import Joi from 'joi';

export const purchaseRequestSchema = Joi.object({
  quantity: Joi.number().integer().min(1000).max(100000).required().messages({
    'number.min': 'Minimum purchase is 1,000 coins',
    'number.max': 'Maximum purchase is 100,000 coins per request',
  }),
  cryptocurrency: Joi.string().valid('BTC', 'USDT', 'ETH').required(),
  cryptoNetwork: Joi.string()
    .valid('Bitcoin', 'TRC20', 'ERC20', 'BEP20')
    .required()
    .messages({
      'any.only': 'Supported networks: Bitcoin, TRC20, ERC20, BEP20',
    }),
});

export const submitProofSchema = Joi.object({
  purchaseId: Joi.string().uuid().required(),
  txHash: Joi.string().min(10).max(100).required().messages({
    'string.min': 'Transaction hash must be at least 10 characters',
  }),
  txProofUrl: Joi.string().uri().optional(),
});

export const sellCoinsSchema = Joi.object({
  userPhone: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in format +234XXXXXXXXXX',
    }),
  quantity: Joi.number().integer().min(10).max(10000).required().messages({
    'number.min': 'Minimum sale is 10 coins',
    'number.max': 'Maximum sale is 10,000 coins per transaction',
  }),
  pricePerCoin: Joi.number().min(50).max(55).required().messages({
    'number.min': 'Minimum price is ₦50 per coin',
    'number.max': 'Maximum price is ₦55 per coin (10% markup limit)',
  }),
  paymentMethod: Joi.string()
    .valid('cash', 'bank_transfer', 'opay', 'palmpay')
    .required(),
  paymentProof: Joi.string().uri().optional(),
});
