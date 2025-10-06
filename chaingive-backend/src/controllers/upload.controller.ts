import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { getFileUrl } from '../middleware/upload';

/**
 * Upload payment proof
 */
export const uploadPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const fileUrl = getFileUrl(req.file.filename, 'payments');

    logger.info(`Payment proof uploaded by user ${userId}: ${fileUrl}`);

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload KYC document
 */
export const uploadKYCDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { documentType } = req.body; // 'id_card', 'passport', 'selfie', 'utility_bill'

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    if (!documentType) {
      throw new AppError('Document type is required', 400, 'MISSING_DOCUMENT_TYPE');
    }

    const fileUrl = getFileUrl(req.file.filename, 'kyc');

    logger.info(`KYC document (${documentType}) uploaded by user ${userId}: ${fileUrl}`);

    res.status(200).json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: {
        documentType,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      throw new AppError('Only image files are allowed for profile pictures', 400, 'INVALID_FILE_TYPE');
    }

    const fileUrl = getFileUrl(req.file.filename, 'profiles');

    // TODO: Update user profile with new picture URL
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { profilePicture: fileUrl },
    // });

    logger.info(`Profile picture uploaded by user ${userId}: ${fileUrl}`);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload marketplace item image
 */
export const uploadMarketplaceImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      throw new AppError('Only image files are allowed for marketplace items', 400, 'INVALID_FILE_TYPE');
    }

    const fileUrl = getFileUrl(req.file.filename, 'marketplace');

    logger.info(`Marketplace image uploaded by user ${userId}: ${fileUrl}`);

    res.status(200).json({
      success: true,
      message: 'Marketplace image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple files (generic)
 */
export const uploadMultipleFiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError('No files uploaded', 400, 'NO_FILES');
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: getFileUrl(file.filename, 'temp'),
      path: file.path,
    }));

    logger.info(`${uploadedFiles.length} files uploaded by user ${userId}`);

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
