import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

/**
 * Sentry request handler middleware
 * Captures request data for error context
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler({
  user: ['id', 'email', 'phoneNumber'],
  ip: true,
  request: ['method', 'url', 'headers'],
});

/**
 * Sentry tracing middleware
 * Tracks performance of HTTP requests
 */
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();

/**
 * Sentry error handler middleware
 * Must be placed AFTER all routes and BEFORE other error handlers
 */
export const sentryErrorHandler: any = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors with status code >= 500
    // Or errors that don't have a status code
    const statusCode = (error as any).statusCode || (error as any).status || 500;
    return statusCode >= 500;
  },
});

/**
 * Custom error logger that sends to Sentry
 */
export function logErrorToSentry(error: Error, req?: Request) {
  Sentry.withScope((scope) => {
    if (req) {
      scope.setContext('request', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Set user context if available
      if ((req as any).user) {
        scope.setUser({
          id: (req as any).user.id,
          email: (req as any).user.email,
        });
      }
    }

    Sentry.captureException(error);
  });

  logger.error('Error captured by Sentry:', error);
}
