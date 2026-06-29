import { 
  findInvitationById, 
  findInvitationByIdWithSender, 
  findExistingPendingInvitation, 
  createInvitation, 
  fetchActiveInvitations
} from '../repositories/index.js';
import { createPrivateRoomService } from './battles/createPrivateRoom.service.js';
import redis from '../config/redis.js';

// --- Shared Helpers ---
const emitSocketEvent = (userId, event, data) => {
  redis.publish('invitation:events', JSON.stringify({ userId, event, data })).catch(err => {
    console.error(`Failed to publish socket event ${event} to user ${userId}`, err);
  });
};

const handleExpiry = async (invite) => {
  if (new Date() > invite.expiresAt) {
    await invite.deleteOne();
    return true; // Expired and removed
  }
  return false; // Valid
};

// --- Services ---

export const createInvitationService = async (senderId, recipientId, battleMode, metadata = {}) => {
  if (senderId.toString() === recipientId.toString()) {
    throw new Error('Cannot invite yourself');
  }

  const existing = await findExistingPendingInvitation(senderId, recipientId, battleMode);

  if (existing) {
    const isExpired = await handleExpiry(existing);
    if (!isExpired) {
      return existing.populate('sender', 'name username avatar');
    }
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  let invite = await createInvitation({
    sender: senderId,
    recipient: recipientId,
    battleMode,
    expiresAt,
    metadata
  });

  invite = await invite.populate('sender', 'name username avatar');
  emitSocketEvent(recipientId, 'battle:invite:new', invite);

  return invite;
};

export const acceptInvitationService = async (inviteId, userId) => {
  const invite = await findInvitationByIdWithSender(inviteId);
  if (!invite) throw new Error('Invitation not found');
  if (invite.recipient.toString() !== userId.toString()) throw new Error('Unauthorized');

  const isExpired = await handleExpiry(invite);
  if (isExpired) throw new Error('Invitation expired');

  const roomName = `Battle: ${invite.sender.username} vs You`;
  const room = await createPrivateRoomService(
    roomName,
    '',
    invite.metadata?.difficulty || 'Medium',
    invite.metadata?.timeLimit || 1200,
    userId,
    '',     // originHeader
    true    // isCasual
  );

  // Delete the invitation from DB once the battle is successfully created
  await invite.deleteOne();

  emitSocketEvent(invite.sender._id.toString(), 'battle:invite:accepted', { invitation: invite, room });
  emitSocketEvent(userId, 'battle:invite:accepted', { invitation: invite, room });

  return { invite, room };
};

export const declineInvitationService = async (inviteId, userId) => {
  const invite = await findInvitationById(inviteId);
  if (!invite) throw new Error('Invitation not found');
  if (invite.recipient.toString() !== userId.toString()) throw new Error('Unauthorized');

  const isExpired = await handleExpiry(invite);
  if (isExpired) throw new Error('Invitation expired');

  // Delete the invitation since it completed its purpose
  await invite.deleteOne();

  emitSocketEvent(invite.sender.toString(), 'battle:invite:declined', invite);

  return invite;
};

export const cancelInvitationService = async (inviteId, userId) => {
  const invite = await findInvitationById(inviteId);
  if (!invite) throw new Error('Invitation not found');
  if (invite.sender.toString() !== userId.toString()) throw new Error('Unauthorized');

  // Delete the cancelled invitation
  await invite.deleteOne();

  // Emitting the cancellation event back to the recipient so their UI clears the card
  emitSocketEvent(invite.recipient.toString(), 'battle:invite:cancelled', { inviteId });

  return invite;
};

export const fetchActiveService = async (userId) => {
  const invites = await fetchActiveInvitations(userId);
  
  const validInvites = [];
  for (const inv of invites) {
    const isExpired = await handleExpiry(inv);
    if (!isExpired) validInvites.push(inv);
  }
  
  return {
    invitations: validInvites,
    total: validInvites.length,
    page: 1,
    limit: 50,
    totalPages: 1
  };
};
