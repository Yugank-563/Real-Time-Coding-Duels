import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  getBattleDetails,
  surrenderBattle,
  getBattleSummary,
  getTopicStats,
  getLobbyStats,
  getTopics,
  createPrivateRoom,
  joinPrivateRoom,
  startPrivateBattle
} from '../controllers/battles/index.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Queue routes
router.post('/queue/join', joinQueue);
router.post('/queue/leave', leaveQueue);
router.get('/queue/status', getQueueStatus);

// Stats & Metadata routes (precedence above dynamic ID)
router.get('/topic-stats', getTopicStats);
router.get('/lobby-stats', getLobbyStats);
router.get('/topics', getTopics);

// Private Custom Room routes
router.post('/private/create', createPrivateRoom);
router.post('/private/join', joinPrivateRoom);
router.post('/private/:roomId/start', startPrivateBattle);

// Dynamic ID routes
router.get('/:id', getBattleDetails);
router.post('/:id/surrender', surrenderBattle);
router.get('/:id/summary', getBattleSummary);

export default router;
