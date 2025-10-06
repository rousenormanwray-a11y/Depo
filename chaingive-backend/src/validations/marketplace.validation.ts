import Joi from 'joi';

export const redeemSchema = Joi.object({
  listingId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(10).default(1),
  deliveryPhone: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .optional(),
});
