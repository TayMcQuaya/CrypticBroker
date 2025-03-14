import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types and size limits
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype as typeof ALLOWED_FILE_TYPES[number])) {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    return;
  }
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Interface for file upload response
export interface FileUploadResponse {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

// Function to delete file
export const deleteFile = async (filename: string): Promise<void> => {
  const filePath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};

// Function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
}; 