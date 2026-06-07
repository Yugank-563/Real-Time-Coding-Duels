import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import {
  submitBattleCode,
  getSubmissionStatus
} from '../controllers/index.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Submission routes
router.post('/battle', submitBattleCode);
router.get('/:id/status', getSubmissionStatus);

export default router;
