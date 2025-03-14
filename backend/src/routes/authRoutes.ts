import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(protect); // All routes after this middleware will be protected
router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);

export default router; 