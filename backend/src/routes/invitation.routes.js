import express from 'express';
import { authMiddleware, validateRequest } from '../middleware/index.js';
import {
  sendInvitation,
  getActiveInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation
} from '../controllers/index.js';
import { sendInvitationSchema, invitationActionSchema } from '../schemas/index.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateRequest(sendInvitationSchema), sendInvitation);
router.get('/', getActiveInvitations);
router.post('/:id/accept', validateRequest(invitationActionSchema), acceptInvitation);
router.post('/:id/decline', validateRequest(invitationActionSchema), declineInvitation);
router.delete('/:id', validateRequest(invitationActionSchema), cancelInvitation);

export default router;
