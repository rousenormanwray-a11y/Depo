import Joi from 'joi';

export const createReferralSchema = Joi.object({
  referrerId: Joi.string().uuid().required(),
  refereePhone: Joi.string().pattern(/^\+234[0-9]{10}$/).required(),
  refereeEmail: Joi.string().email().optional(),
});

export const applyReferralCodeSchema = Joi.object({
  referralCode: Joi.string().alphanum().min(6).max(12).required(),
  userId: Joi.string().uuid().required(),
});

export const referralBonusTriggerSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  triggerEvent: Joi.string().valid('registration', 'cycle_complete', 'leaderboard').required(),
  cycleNumber: Joi.number().integer().optional(),
});