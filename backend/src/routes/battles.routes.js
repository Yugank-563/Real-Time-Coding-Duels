import express from 'express';
import { authMiddleware, validateRequest } from '../middleware/index.js';
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
  startPrivateBattle,
  getHealth
} from '../controllers/index.js';
import {
  createPrivateRoomSchema,
  joinPrivateRoomSchema,
  battleActionSchema,
  joinQueueSchema,
  leaveQueueSchema,
  getQueueStatusSchema
} from '../schemas/index.js';

const router = express.Router();

// Public Endpoints
router.get('/health', getHealth);
router.get('/topic-stats', getTopicStats);
router.get('/lobby-stats', getLobbyStats);
router.get('/topics', getTopics);

// Apply auth middleware to all remaining routes
router.use(authMiddleware);

// Queue routes
router.post('/queue/join', validateRequest(joinQueueSchema), joinQueue);
router.post('/queue/leave', validateRequest(leaveQueueSchema), leaveQueue);
router.get('/queue/status', validateRequest(getQueueStatusSchema), getQueueStatus);

// Private Custom Room routes
router.post('/private/create', validateRequest(createPrivateRoomSchema), createPrivateRoom);
router.post('/private/join', validateRequest(joinPrivateRoomSchema), joinPrivateRoom);
router.post('/private/:id/start', validateRequest(battleActionSchema), startPrivateBattle);

// Dynamic ID routes
router.get('/:id', validateRequest(battleActionSchema), getBattleDetails);
router.post('/:id/surrender', validateRequest(battleActionSchema), surrenderBattle);
router.get('/:id/summary', validateRequest(battleActionSchema), getBattleSummary);

export default router;
