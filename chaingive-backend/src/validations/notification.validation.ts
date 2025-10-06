import Joi from 'joi';

export const registerDeviceTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Device token is required',
  }),
  platform: Joi.string().valid('ios', 'android').required(),
});

export const unregisterDeviceTokenSchema = Joi.object({
  token: Joi.string().required(),
});
