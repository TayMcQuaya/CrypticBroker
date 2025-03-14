import express from 'express';
import * as userController from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/auth';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Routes for current user
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin only routes
router.get('/', restrictTo('ADMIN'), userController.getAllUsers);

export default router; 