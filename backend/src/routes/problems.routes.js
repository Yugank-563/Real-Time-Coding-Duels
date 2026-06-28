import express from 'express';
import { executionLimiter, authMiddleware, validateRequest } from '../middleware/index.js';
import {
  getProblems,
  getProblemDetails,
  runCode,
  submitProblemCode
} from '../controllers/index.js';
import {
  getProblemsSchema,
  runCodeSchema,
  submitCodeSchema,
  slugSchema,
} from '../schemas/index.js';

const router = express.Router();

// Retrieve all problems
router.get('/', validateRequest(getProblemsSchema), getProblems);

// Retrieve a single problem by slug.
router.get('/:slug', authMiddleware, validateRequest(slugSchema), getProblemDetails);

// Run user code
router.post('/:slug/run', executionLimiter, authMiddleware, validateRequest(runCodeSchema), runCode);

// Submit code
router.post('/:slug/submit', executionLimiter, authMiddleware, validateRequest(submitCodeSchema), submitProblemCode);

export default router;
