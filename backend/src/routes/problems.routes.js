import express from 'express';
import { executionLimiter } from '../middleware/index.js';
import { authMiddleware } from '../middleware/index.js';
import {
  getProblems,
  getProblemDetails,
  runCode,
  submitProblemCode
} from '../controllers/index.js';

const router = express.Router();

// Retrieve all problems
router.get('/', getProblems);

// Retrieve a single problem by slug.
router.get('/:slug', authMiddleware, getProblemDetails);

// Run user code
router.post('/:slug/run', executionLimiter, authMiddleware, runCode);

// Submit code
router.post('/:slug/submit', executionLimiter, authMiddleware, submitProblemCode);

export default router;
