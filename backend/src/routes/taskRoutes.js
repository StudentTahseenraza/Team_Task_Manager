import express from 'express';
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  getUserTasks
} from '../controllers/taskController.js';
import { protect, projectMember } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/my-tasks', getUserTasks);
router.post('/', createTask);
router.get('/project/:projectId', projectMember, getProjectTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;