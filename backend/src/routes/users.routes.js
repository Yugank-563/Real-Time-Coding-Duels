import express from 'express';
import { authMiddleware, optionalAuthMiddleware, validateRequest } from '../middleware/index.js';
import { searchUsers, getProfile, updateProfile, getLeaderboard, getPlatformStats } from '../controllers/index.js';
import { searchUsersSchema, updateProfileSchema, getLeaderboardSchema } from '../schemas/index.js';

const router = express.Router();

// Public/Optional auth routes
router.get('/leaderboard', optionalAuthMiddleware, validateRequest(getLeaderboardSchema), getLeaderboard);
router.get('/platform-stats', getPlatformStats);

// Apply auth middleware to all remaining routes
router.use(authMiddleware);

// Protected User routes
router.get('/search', validateRequest(searchUsersSchema), searchUsers);
router.get('/profile/:username', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

export default router;
