import express from 'express';
import {
  getTaskSuggestions,
  analyzeTask,
  getProjectSummary
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/suggestions/:projectId', getTaskSuggestions);
router.post('/analyze-task', analyzeTask);
router.get('/summary/:projectId', getProjectSummary);

export default router;