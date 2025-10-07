import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendOTP, verifyOTP } from '../services/otp.service';
import { sendWelcomeEmail } from '../services/email.service';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, email, password, firstName, lastName, locationCity, locationState, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.phoneNumber === phoneNumber) {
        throw new AppError('Phone number already registered', 409, 'PHONE_EXISTS');
      }
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Process referral code if provided
    let referrerId: string | undefined;
    if (referralCode) {
      // Find referrer by code (stored in metadata or generate from user data)
      // For now, we'll create a simple referral code system
      const referrer = await prisma.user.findFirst({
        where: {
          // Assuming referral code is first 4 chars of firstName + last 6 of userId
          // We'll need to search or maintain a referralCode field
          id: { contains: referralCode.substring(4).toLowerCase() },
        },
      });
      
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user and wallet in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber,
          email,
          passwordHash,
          firstName,
          lastName,
          locationCity,
          locationState,
        },
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tier: true,
        },
      });

      // Create wallet for user
      await tx.wallet.create({
        data: {
          userId: newUser.id,
        },
      });

      // Process referral if referrerId exists
      if (referrerId) {
        // Create referral record
        await tx.referral.create({
          data: {
            referrerId,
            referredUserId: newUser.id,
            referralCode: referralCode || '',
            status: 'registered',
          },
        });

        // Award 25 coins to referrer
        await tx.user.update({
          where: { id: referrerId },
          data: {
            charityCoinsBalance: { increment: 25 },
          },
        });
      }

      return newUser;
    });

    // Send OTP for phone verification
    await sendOTP(phoneNumber);

    // Send welcome email if email provided
    if (email) {
      await sendWelcomeEmail(email, firstName);
    }

    logger.info(`User registered: ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: {
        user,
        requiresOTP: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    if (user.isBanned) {
      throw new AppError('Account is banned', 403, 'ACCOUNT_BANNED', {
        reason: user.banReason,
      });
    }

    // Check if phone is verified
    const phoneVerified = await prisma.kycRecord.findFirst({
      where: {
        userId: user.id,
        verificationType: 'phone',
        status: 'approved',
      },
    });

    if (!phoneVerified) {
      // Send OTP
      await sendOTP(phoneNumber);
      return res.status(200).json({
        success: true,
        message: 'Please verify your phone number',
        data: {
          requiresOTP: true,
          phoneNumber,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.id}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tier: user.tier,
          trustScore: user.trustScore,
          charityCoinsBalance: user.charityCoinsBalance,
          wallet: user.wallet,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(phoneNumber, otp);

    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { wallet: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Create or update KYC record
    await prisma.kycRecord.upsert({
      where: {
        userId_verificationType: {
          userId: user.id,
          verificationType: 'phone',
        },
      },
      create: {
        userId: user.id,
        verificationType: 'phone',
        status: 'approved',
        verifiedAt: new Date(),
      },
      update: {
        status: 'approved',
        verifiedAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    logger.info(`OTP verified for user: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tier: user.tier,
          trustScore: user.trustScore,
          charityCoinsBalance: user.charityCoinsBalance,
          wallet: user.wallet,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Send OTP
    await sendOTP(phoneNumber);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new AppError('JWT refresh secret not configured', 500, 'CONFIG_ERROR');
    }

    const decoded = jwt.verify(refreshToken, secret) as { id: string };

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    res.status(200).json({
      success: true,
      data: {
        token: accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    } else {
      next(error);
    }
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If the phone number exists, an OTP has been sent',
      });
    }

    // Send OTP
    await sendOTP(phoneNumber);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(phoneNumber, otp);

    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    logger.info(`Password reset for user: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function generateAccessToken(payload: any): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!secret) {
    throw new AppError('JWT secret not configured', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

function generateRefreshToken(payload: any): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  if (!secret) {
    throw new AppError('JWT refresh secret not configured', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(payload, secret, { expiresIn });
}
