import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember
} from '../controllers/projectController.js';
import { protect, adminOnly, projectMember } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);

export default router;