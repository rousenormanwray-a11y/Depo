import Joi from 'joi';

export const getCyclesSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'in_transit', 'received', 'obligated', 'fulfilled', 'defaulted')
    .optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

export const cycleIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
