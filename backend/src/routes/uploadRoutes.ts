import express from 'express';
import { protect } from '../middlewares/auth';
import { upload } from '../services/upload.service';
import * as uploadController from '../controllers/uploadController';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// Upload single file
router.post('/single', upload.single('file'), uploadController.uploadSingleFile);

// Upload multiple files (max 5)
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultipleFiles);

// Delete file
router.delete('/:filename', uploadController.deleteUploadedFile);

export default router; 