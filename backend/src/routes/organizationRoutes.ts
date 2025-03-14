import express from 'express';
import * as organizationController from '../controllers/organizationController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// All organization routes require authentication
router.use(protect);

// Organization CRUD routes
router.route('/')
  .get(organizationController.getOrganizations)
  .post(organizationController.createOrganization);

router.route('/:id')
  .get(organizationController.getOrganization)
  .patch(organizationController.updateOrganization);

// Member management routes
router.route('/:id/members')
  .post(organizationController.addMember);

router.route('/:id/members/:memberId')
  .delete(organizationController.removeMember);

export default router; 