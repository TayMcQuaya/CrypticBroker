import express from 'express';
import * as applicationController from '../controllers/applicationController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// All application routes require authentication
router.use(protect);

// Routes for user's own applications
router.route('/')
  .get(applicationController.getMyApplications)
  .post(applicationController.createApplication);

// Routes for specific application by ID
router.route('/:id')
  .get(applicationController.getApplication)
  .delete(applicationController.deleteApplication);

// Route for updating application status
router.patch('/:id/status', applicationController.updateApplicationStatus);

// Route for getting applications for an organization
router.get('/organization/:id', applicationController.getOrganizationApplications);

export default router; 