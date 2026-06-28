import { Invitation } from '../models/index.js';


// Create
export const create = (data) => Invitation.create(data);


// Find
export const findById = (id) => Invitation.findById(id);

export const findByIdWithSender = (id) => Invitation.findById(id).populate('sender');

export const findExistingPending = (senderId, recipientId, battleMode) => 
  Invitation.findOne({
    sender: senderId,
    recipient: recipientId,
    battleMode
  });

export const findUnread = (userId) => 
  Invitation.find({
    recipient: userId,
    readAt: null
  })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 });


// Search
export const fetchHistory = async (userId, page, limit) => {
  const skip = (page - 1) * limit;
  const query = { $or: [{ recipient: userId }, { sender: userId }] };
  
  const invites = await Invitation.find(query)
    .populate('sender', 'name username avatar')
    .populate('recipient', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Invitation.countDocuments(query);

  return { invites, total };
};


// Update
export const markAsRead = (userId) => 
  Invitation.updateMany(
    { recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );


// Backward Compatibility Aliases
export const createInvitation = create;
export const findInvitationById = findById;
export const findInvitationByIdWithSender = findByIdWithSender;
export const findExistingPendingInvitation = findExistingPending;
export const fetchUnreadInvitations = findUnread;
export const fetchInvitationHistory = fetchHistory;
export const markInvitationsRead = markAsRead;
