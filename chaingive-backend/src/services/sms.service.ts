import axios from 'axios';
import logger from '../utils/logger';

const TERMII_API_KEY = process.env.TERMII_API_KEY || '';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'ChainGive';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

/**
 * Send SMS via Termii
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (!TERMII_API_KEY) {
      logger.warn('Termii API key not configured. SMS not sent.');
      logger.info(`[DEV MODE] SMS to ${phoneNumber}: ${message}`);
      return false;
    }

    const response = await axios.post(`${TERMII_BASE_URL}/sms/send`, {
      to: phoneNumber,
      from: TERMII_SENDER_ID,
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: TERMII_API_KEY,
    });

    if (response.data.message === 'Successfully Sent') {
      logger.info(`SMS sent to ${phoneNumber} via Termii`);
      return true;
    } else {
      logger.error(`Termii SMS failed:`, response.data);
      return false;
    }
  } catch (error: any) {
    logger.error(`Failed to send SMS to ${phoneNumber}:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Send OTP via Termii Token API (preferred for OTP)
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    if (!TERMII_API_KEY) {
      logger.warn('Termii API key not configured. OTP SMS not sent.');
      logger.info(`[DEV MODE] OTP to ${phoneNumber}: ${otp}`);
      return true; // Return true in dev mode
    }

    // Format phone number (ensure it starts with country code)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.slice(1)}`;

    const response = await axios.post(`${TERMII_BASE_URL}/sms/otp/send`, {
      api_key: TERMII_API_KEY,
      message_type: 'NUMERIC',
      to: formattedPhone,
      from: TERMII_SENDER_ID,
      channel: 'generic',
      pin_attempts: 3,
      pin_time_to_live: 10, // OTP valid for 10 minutes
      pin_length: 6,
      pin_placeholder: '< 1234 >',
      message_text: `Your ChainGive OTP is < 1234 >. Valid for 10 minutes. Do not share this code.`,
      pin_type: 'NUMERIC',
    });

    if (response.data.pinId) {
      logger.info(`OTP sent to ${phoneNumber} via Termii. Pin ID: ${response.data.pinId}`);
      return true;
    } else {
      logger.error(`Termii OTP send failed:`, response.data);
      return false;
    }
  } catch (error: any) {
    logger.error(`Failed to send OTP SMS to ${phoneNumber}:`, error.response?.data || error.message);
    // In development, return true to allow testing
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV MODE] Allowing OTP send despite error`);
      return true;
    }
    return false;
  }
}

/**
 * Verify OTP via Termii
 */
export async function verifyOTPSMS(pinId: string, pin: string): Promise<boolean> {
  try {
    if (!TERMII_API_KEY) {
      logger.warn('Termii API key not configured. Skipping verification.');
      return true; // In dev mode, accept any OTP
    }

    const response = await axios.post(`${TERMII_BASE_URL}/sms/otp/verify`, {
      api_key: TERMII_API_KEY,
      pin_id: pinId,
      pin,
    });

    if (response.data.verified === 'True' || response.data.verified === true) {
      logger.info(`OTP verified successfully via Termii`);
      return true;
    } else {
      logger.warn(`OTP verification failed:`, response.data);
      return false;
    }
  } catch (error: any) {
    logger.error(`OTP verification error:`, error.response?.data || error.message);
    return false;
  }
}

/**
 * Send welcome SMS
 */
export async function sendWelcomeSMS(phoneNumber: string, firstName: string): Promise<boolean> {
  const message = `Welcome to ChainGive, ${firstName}! 🎉\n\nStart your giving journey today. Download the app and complete your profile to begin.\n\n- Team ChainGive`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send donation confirmation SMS
 */
export async function sendDonationConfirmationSMS(
  phoneNumber: string,
  amount: number,
  recipient: string
): Promise<boolean> {
  const message = `ChainGive: You sent ₦${amount.toLocaleString()} to ${recipient}. Your donation will be confirmed within 48 hours. Thank you for giving! 💚`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send receipt confirmation SMS
 */
export async function sendReceiptConfirmationSMS(
  phoneNumber: string,
  amount: number,
  donor: string
): Promise<boolean> {
  const message = `ChainGive: You received ₦${amount.toLocaleString()} from ${donor}. Funds will be available in 48 hours. Time to pay it forward! 🔄`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send cycle reminder SMS
 */
export async function sendCycleReminderSMS(
  phoneNumber: string,
  firstName: string,
  amount: number,
  daysLeft: number
): Promise<boolean> {
  const message = `Hi ${firstName}, your ChainGive donation of ₦${amount.toLocaleString()} is due in ${daysLeft} days. Open the app to give forward and keep the chain going! 💚`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send escrow release SMS
 */
export async function sendEscrowReleaseSMS(
  phoneNumber: string,
  amount: number
): Promise<boolean> {
  const message = `ChainGive: ₦${amount.toLocaleString()} has been released to your wallet! You can now use these funds to pay it forward. Keep the giving chain alive! 🔗`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send KYC approval SMS
 */
export async function sendKYCApprovalSMS(
  phoneNumber: string,
  firstName: string,
  verificationType: string
): Promise<boolean> {
  const message = `Hi ${firstName}, your KYC verification for '${verificationType}' has been approved! You can now access more features on ChainGive.`;
  return sendSMS(phoneNumber, message);
}

/**
 * Check Termii balance
 */
export async function checkSMSBalance(): Promise<number | null> {
  try {
    if (!TERMII_API_KEY) {
      return null;
    }

    const response = await axios.get(`${TERMII_BASE_URL}/get-balance?api_key=${TERMII_API_KEY}`);
    const balance = parseFloat(response.data.balance);
    
    logger.info(`Termii SMS balance: ₦${balance}`);
    return balance;
  } catch (error: any) {
    logger.error('Failed to check SMS balance:', error.response?.data || error.message);
    return null;
  }
}
