import Joi from 'joi';

export const matchIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const rejectMatchSchema = Joi.object({
  reason: Joi.string().min(10).max(500).optional(),
});
