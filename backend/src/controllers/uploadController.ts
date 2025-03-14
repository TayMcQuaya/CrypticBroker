import { Request, Response, NextFunction } from 'express';
import { deleteFile, getFileUrl, FileUploadResponse } from '../services/upload.service';

/**
 * @desc    Upload a single file
 * @route   POST /api/upload/single
 * @access  Private
 */
export const uploadSingleFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
      return;
    }

    const fileResponse: FileUploadResponse = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: getFileUrl(req.file.filename),
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.status(200).json({
      status: 'success',
      data: {
        file: fileResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
export const uploadMultipleFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
      return;
    }

    const fileResponses: FileUploadResponse[] = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: getFileUrl(file.filename),
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      status: 'success',
      data: {
        files: fileResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a file
 * @route   DELETE /api/upload/:filename
 * @access  Private
 */
export const deleteUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({
        status: 'error',
        message: 'Filename is required'
      });
      return;
    }

    await deleteFile(filename);

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 