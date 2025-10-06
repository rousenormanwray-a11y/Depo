import { Request, Response, NextFunction } from 'express';
import { isFeatureEnabled } from '../services/featureFlags.service';
import { AppError } from './errorHandler';

/**
 * Middleware to check if a feature is enabled
 */
export function requireFeature(featureName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enabled = await isFeatureEnabled(featureName);

      if (!enabled) {
        throw new AppError(
          `Feature '${featureName}' is currently disabled`,
          503,
          'FEATURE_DISABLED'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
