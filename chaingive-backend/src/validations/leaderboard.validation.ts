import Joi from 'joi';

export const purchaseBoostSchema = Joi.object({
  boostId: Joi.string()
    .valid(
      'multiplier_2x_7d',
      'multiplier_3x_7d',
      'visibility_30d',
      'position_instant',
      'multiplier_1_5x_30d'
    )
    .required()
    .messages({
      'any.only': 'Invalid boost ID. Check available boosts first.',
    }),
});
