import { 
  findInvitationById, 
  findInvitationByIdWithSender, 
  findExistingPendingInvitation, 
  createInvitation, 
  fetchActiveInvitations,
  createBattle,
  findUserById,
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
  
  const senderUser = await findUserById(invite.sender._id);
  const recipientUser = await findUserById(userId);
  const excludedIds = [
    ...(senderUser?.solvedProblems || []),
    ...(recipientUser?.solvedProblems || [])
  ];

  const problemData = await getRandomProblem(null, difficulty, excludedIds);

  // getRandomProblem always returns a real MongoDB document with _id — no upsert needed
  let dbProblem = problemData;

  const getDynamicTimeLimit = (mode, diff) => {
    const diffLower = (diff || 'medium').toLowerCase();
    if (mode === 'timed-sprint') {
      if (diffLower === 'easy') return 10 * 60; // Temp set to 1 min for testing
      if (diffLower === 'hard') return 30 * 60;
      return 20 * 60; // medium
    } else {
      if (diffLower === 'easy') return 20 * 60;
      if (diffLower === 'hard') return 60 * 60;
      return 40 * 60; // medium
    }
  };
  
  // Create 2-player active battle
  const battle = await createBattle({
    battleType: invite.battleMode || 'random-duel',
    mode: invite.metadata?.mode || 'casual',
    status: 'waiting',
    startTime: new Date(),
    timeLimit: getDynamicTimeLimit(invite.battleMode, dbProblem.difficulty),
    problem: dbProblem._id,
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),

    host: invite.sender._id,
    players: [
      { user: invite.sender._id, status: 'not_ready' },
      { user: userId, status: 'not_ready' },
    ],
  });

  // Delete the invitation from DB once the battle is successfully created
  await invite.deleteOne();

  emitSocketEvent(invite.sender._id.toString(), 'battle:invite:accepted', { invitation: invite, room: battle.toObject({ flattenMaps: true }) });
  emitSocketEvent(userId, 'battle:invite:accepted', { invitation: invite, room: battle.toObject({ flattenMaps: true }) });

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
