import Joi from 'joi';

export const registerSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in format +234XXXXXXXXXX',
    }),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  locationCity: Joi.string().max(100).optional(),
  locationState: Joi.string().max(100).optional(),
});

export const loginSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
  password: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const resendOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
});

export const resetPasswordSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+234[0-9]{10}$/)
    .required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
});
