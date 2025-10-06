import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  locationCity: Joi.string().max(100).optional(),
  locationState: Joi.string().max(100).optional(),
  preferredLanguage: Joi.string().valid('en', 'pidgin', 'yo', 'ha', 'ig').optional(),
});
