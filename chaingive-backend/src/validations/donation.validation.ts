import Joi from 'joi';

export const giveSchema = Joi.object({
  amount: Joi.number().min(1000).max(1000000).required().messages({
    'number.min': 'Minimum donation amount is ₦1,000',
    'number.max': 'Maximum donation amount is ₦1,000,000',
  }),
  recipientPreference: Joi.string().valid('algorithm', 'manual').default('algorithm'),
  recipientId: Joi.string().uuid().when('recipientPreference', {
    is: 'manual',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  locationPreference: Joi.string().max(100).optional(),
  faithPreference: Joi.string().max(50).optional(),
});

export const confirmReceiptSchema = Joi.object({
  transactionId: Joi.string().uuid().required(),
  confirm: Joi.boolean().required(),
});
