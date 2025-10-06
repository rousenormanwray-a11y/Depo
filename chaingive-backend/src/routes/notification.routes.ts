import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /v1/notifications/device-token
 * @desc    Register device token for push notifications
 * @access  Private
 */
router.post(
  '/device-token',
  validate(
    Joi.object({
      token: Joi.string().required().min(20),
      platform: Joi.string().valid('ios', 'android').required(),
    })
  ),
  notificationController.registerDeviceToken
);

/**
 * @route   DELETE /v1/notifications/device-token/:token
 * @desc    Unregister device token
 * @access  Private
 */
router.delete('/device-token/:token', notificationController.unregisterDeviceToken);

/**
 * @route   POST /v1/notifications/test
 * @desc    Send test notification (for debugging)
 * @access  Private
 */
router.post(
  '/test',
  validate(
    Joi.object({
      title: Joi.string().optional(),
      body: Joi.string().optional(),
    })
  ),
  notificationController.sendTestNotification
);

export default router;
