import { 
  findInvitationById, 
  findInvitationByIdWithSender, 
  findExistingPendingInvitation, 
  createInvitation, 
  fetchActiveInvitations,
  createBattle,
  findOneAndUpdateProblem
} from '../repositories/index.js';
import { getRandomProblem } from './problemService.js';
import redis from '../config/redis.js';

// Shared Helpers
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

// Services

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

  // Fetch Problem
  const difficulty = invite.metadata?.difficulty || 'Medium';
  const problemData = await getRandomProblem('Array', difficulty);

  let dbProblem = await findOneAndUpdateProblem(
    { titleSlug: problemData.titleSlug || problemData.title },
    {
      ...problemData,
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),
      description: problemData.content || problemData.description || '',
      boilerplates: problemData.boilerplates || { cpp: `class Solution {\npublic:\n    // Write your code here\n};` }
    },
    { upsert: true, new: true }
  );

  const getDynamicTimeLimit = (mode, diff) => {
    const diffLower = (diff || 'medium').toLowerCase();
    if (mode === 'timed-sprint') {
      if (diffLower === 'easy') return 15 * 60;
      if (diffLower === 'hard') return 45 * 60;
      return 30 * 60; // medium
    } else {
      if (diffLower === 'easy') return 30 * 60;
      if (diffLower === 'hard') return 80 * 60;
      return 50 * 60; // medium
    }
  };
  
  // Create 2-player active battle
  const battle = await createBattle({
    battleType: invite.battleMode || 'random-duel',
    mode: 'casual',
    status: 'waiting',
    startTime: new Date(),
    timeLimit: getDynamicTimeLimit(invite.battleMode, dbProblem.difficulty),
    problem: dbProblem._id,
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),
    roomName: `Battle: ${invite.sender.username} vs You`,
    host: invite.sender._id,
    players: [
      { user: invite.sender._id, status: 'not_ready' },
      { user: userId, status: 'not_ready' },
    ],
  });

  // Delete the invitation from DB once the battle is successfully created
  await invite.deleteOne();

  emitSocketEvent(invite.sender._id.toString(), 'battle:invite:accepted', { invitation: invite, room: battle });
  emitSocketEvent(userId, 'battle:invite:accepted', { invitation: invite, room: battle });

  return { invite, room: battle };
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
