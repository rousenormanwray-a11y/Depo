import crypto from 'crypto';
import logger from '../utils/logger';
import { sendOTPSMS } from './sms.service';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP with expiration (10 minutes)
 */
export async function storeOTP(phoneNumber: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(phoneNumber, { otp, expiresAt });

  // Clean up after expiration
  setTimeout(() => {
    otpStore.delete(phoneNumber);
  }, 10 * 60 * 1000);

  logger.info(`OTP stored for ${phoneNumber}, expires at ${expiresAt.toISOString()}`);
}

/**
 * Send OTP via SMS (Termii integration)
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  const otp = generateOTP();
  await storeOTP(phoneNumber, otp);

  // Send via Termii
  const sent = await sendOTPSMS(phoneNumber, otp);

  if (!sent) {
    logger.error(`Failed to send OTP to ${phoneNumber}`);
    // In development, continue anyway
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Failed to send OTP');
    }
  }

  // In development, also log the OTP
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[DEV] OTP for ${phoneNumber}: ${otp}`);
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const stored = otpStore.get(phoneNumber);

  if (!stored) {
    logger.warn(`No OTP found for ${phoneNumber}`);
    return false;
  }

  // Check expiration
  if (new Date() > stored.expiresAt) {
    logger.warn(`OTP expired for ${phoneNumber}`);
    otpStore.delete(phoneNumber);
    return false;
  }

  // Verify OTP
  if (stored.otp !== otp) {
    logger.warn(`Invalid OTP for ${phoneNumber}. Expected: ${stored.otp}, Received: ${otp}`);
    return false;
  }

  // Remove OTP after successful verification
  otpStore.delete(phoneNumber);
  logger.info(`OTP verified successfully for ${phoneNumber}`);
  return true;
}
