import express from 'express';
import * as formController from '../controllers/formController';
import { protect, restrictTo } from '../middlewares/auth';

const router = express.Router();

// All form routes require authentication
router.use(protect);

// Public form routes (for authenticated users)
router.get('/', formController.getForms);
router.get('/:id', formController.getForm);
router.post('/:id/submit', formController.submitForm);

// Submission routes
router.get('/submissions/me', formController.getMySubmissions);
router.get('/submissions/:id', formController.getSubmission);

// Admin only routes
router.post('/', restrictTo('ADMIN'), formController.createForm);
router.patch('/:id', restrictTo('ADMIN'), formController.updateForm);
router.get('/:id/submissions', restrictTo('ADMIN', 'INVESTOR'), formController.getFormSubmissions);

export default router; 