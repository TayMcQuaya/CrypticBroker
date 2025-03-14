import express from 'express';
import * as projectController from '../controllers/projectController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Routes for user's own projects
router.route('/')
  .get(projectController.getMyProjects)
  .post(projectController.createProject);

// Routes for specific project by ID
router.route('/:id')
  .get(projectController.getProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

export default router; 