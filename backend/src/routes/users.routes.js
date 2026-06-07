import express from 'express';
import { authMiddleware } from '../middleware/index.js';
import { searchUsers, getProfile, updateProfile } from '../controllers/index.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// User routes
router.get('/search', searchUsers);
router.get('/profile/:username', getProfile);
router.put('/profile', updateProfile);

export default router;
