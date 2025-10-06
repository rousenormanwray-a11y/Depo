import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { saveDeviceToken, removeDeviceToken, sendPushNotification } from '../services/notification.service';

/**
 * Register device token
 */
export const registerDeviceToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { token, platform } = req.body;

    await saveDeviceToken(userId, token, platform);

    logger.info(`Device token registered for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Device token registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unregister device token
 */
export const unregisterDeviceToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { token } = req.params;

    await removeDeviceToken(userId, token);

    logger.info(`Device token unregistered for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Device token removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send test notification (for debugging)
 */
export const sendTestNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, body } = req.body;

    const sent = await sendPushNotification(
      userId,
      title || 'Test Notification',
      body || 'This is a test notification from ChainGive',
      { type: 'test' }
    );

    if (!sent) {
      throw new AppError('Failed to send notification. Check if device token is registered.', 400, 'NOTIFICATION_FAILED');
    }

    res.status(200).json({
      success: true,
      message: 'Test notification sent',
    });
  } catch (error) {
    next(error);
  }
};
