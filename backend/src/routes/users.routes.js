import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { searchUsers } from '../controllers/users/index.js';

const router = express.Router();

// User routes
router.get('/search', authMiddleware, searchUsers);

export default router;
