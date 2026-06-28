import { 
  createInvitationService,
  fetchUnreadService,
  fetchHistoryService,
  markReadService,
  acceptInvitationService,
  declineInvitationService,
  cancelInvitationService
} from '../services/index.js';
import { findUserByUsername } from '../repositories/index.js';

export const sendInvitation = async (req, res, next) => {
  try {
    let { recipientId, battleMode, metadata } = req.body;
    const senderId = req.userId;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }

    if (!recipientId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await findUserByUsername(recipientId.toLowerCase());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      recipientId = user._id;
    }

    const invite = await createInvitationService(senderId, recipientId, battleMode, metadata);
    res.status(201).json({ success: true, invite });
  } catch (error) {
    next(error);
  }
};

export const getUnreadInvitations = async (req, res, next) => {
  try {
    const invites = await fetchUnreadService(req.userId);
    res.status(200).json({ success: true, invites });
  } catch (error) {
    next(error);
  }
};

export const getInvitationHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await fetchHistoryService(req.userId, page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await markReadService(req.userId);
    res.status(200).json({ success: true, message: 'Invitations marked as read' });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const result = await acceptInvitationService(req.params.id, req.userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const declineInvitation = async (req, res, next) => {
  try {
    const result = await declineInvitationService(req.params.id, req.userId);
    res.status(200).json({ success: true, invite: result });
  } catch (error) {
    next(error);
  }
};

export const cancelInvitation = async (req, res, next) => {
  try {
    const result = await cancelInvitationService(req.params.id, req.userId);
    res.status(200).json({ success: true, invite: result });
  } catch (error) {
    next(error);
  }
};
