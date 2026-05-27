import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  submitCode,
  getSubmissionStatus
} from '../controllers/submissions/index.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Submission routes
router.post('/battle', submitCode);
router.get('/:id/status', getSubmissionStatus);

export default router;
