import crypto from 'crypto';
import logger from '../utils/logger';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP with expiration (5 minutes)
 */
export async function storeOTP(phoneNumber: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  otpStore.set(phoneNumber, { otp, expiresAt });

  // Clean up after expiration
  setTimeout(() => {
    otpStore.delete(phoneNumber);
  }, 5 * 60 * 1000);
}

/**
 * Send OTP via SMS (Twilio integration)
 */
export async function sendOTP(phoneNumber: string): Promise<void> {
  const otp = generateOTP();
  await storeOTP(phoneNumber, otp);

  // TODO: Integrate with Twilio
  // For now, just log the OTP (REMOVE IN PRODUCTION!)
  logger.info(`OTP for ${phoneNumber}: ${otp}`);

  // Twilio integration example:
  /*
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your ChainGive verification code is: ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
  */
}

/**
 * Verify OTP
 */
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const stored = otpStore.get(phoneNumber);

  if (!stored) {
    return false;
  }

  // Check expiration
  if (new Date() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return false;
  }

  // Verify OTP
  if (stored.otp !== otp) {
    return false;
  }

  // Remove OTP after successful verification
  otpStore.delete(phoneNumber);
  return true;
}
