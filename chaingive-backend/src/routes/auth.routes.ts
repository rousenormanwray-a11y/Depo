import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import * as authValidation from '../validations/auth.validation';

const router = Router();

/**
 * @route   POST /v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(authValidation.registerSchema), authController.register);

/**
 * @route   POST /v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(authValidation.loginSchema), authController.login);

/**
 * @route   POST /v1/auth/verify-otp
 * @desc    Verify OTP for phone/email
 * @access  Public
 */
router.post('/verify-otp', validate(authValidation.verifyOtpSchema), authController.verifyOtp);

/**
 * @route   POST /v1/auth/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post('/resend-otp', validate(authValidation.resendOtpSchema), authController.resendOtp);

/**
 * @route   POST /v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validate(authValidation.refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validate(authValidation.forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validate(authValidation.resetPasswordSchema), authController.resetPassword);

export default router;
