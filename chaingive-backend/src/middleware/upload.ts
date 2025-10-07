import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';
import logger from '../utils/logger';

// Ensure upload directories exist
const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');
const UPLOAD_DIRS = {
  payments: path.join(UPLOAD_BASE_DIR, 'payments'),
  kyc: path.join(UPLOAD_BASE_DIR, 'kyc'),
  profiles: path.join(UPLOAD_BASE_DIR, 'profiles'),
  marketplace: path.join(UPLOAD_BASE_DIR, 'marketplace'),
  temp: path.join(UPLOAD_BASE_DIR, 'temp'),
};

// Create upload directories if they don't exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created upload directory: ${dir}`);
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine destination based on file type or request path
    let uploadDir = UPLOAD_DIRS.temp;

    if (req.path.includes('payment')) {
      uploadDir = UPLOAD_DIRS.payments;
    } else if (req.path.includes('kyc')) {
      uploadDir = UPLOAD_DIRS.kyc;
    } else if (req.path.includes('profile')) {
      uploadDir = UPLOAD_DIRS.profiles;
    } else if (req.path.includes('marketplace')) {
      uploadDir = UPLOAD_DIRS.marketplace;
    }

    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${sanitizedName}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
  }
};

// Create multer upload instances
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName: string = 'file') => upload.single(fieldName);

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

/**
 * Upload fields (multiple fields with different names)
 */
export const uploadFields = (fields: Array<{ name: string; maxCount: number }>) => 
  upload.fields(fields);

/**
 * Get file URL
 */
export function getFileUrl(filename: string, category: 'payments' | 'kyc' | 'profiles' | 'marketplace' | 'temp' = 'temp'): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${category}/${filename}`;
}

/**
 * Delete file
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Failed to delete file ${filePath}:`, error);
    return false;
  }
}

/**
 * Get file info
 */
export function getFileInfo(filePath: string): { size: number; mimeType: string; exists: boolean } | null {
  try {
    if (!fs.existsSync(filePath)) {
      return { size: 0, mimeType: '', exists: false };
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    return {
      size: stats.size,
      mimeType: mimeTypes[ext] || 'application/octet-stream',
      exists: true,
    };
  } catch (error) {
    logger.error(`Failed to get file info for ${filePath}:`, error);
    return null;
  }
}

export { UPLOAD_DIRS };
