import { Invitation } from '../models/index.js';


// Create
const create = (data) => Invitation.create(data);


// Find
const findById = (id) => Invitation.findById(id);

const findByIdWithSender = (id) => Invitation.findById(id).populate('sender');

const findExistingPending = (senderId, recipientId, battleMode) => 
  Invitation.findOne({
    sender: senderId,
    recipient: recipientId,
    battleMode
  });

const findActiveIncoming = (userId) => 
  Invitation.find({ recipient: userId })
    .populate('sender', 'name username avatar')
    .sort({ createdAt: -1 });

// Backward Compatibility Aliases
export const createInvitation = create;
export const findInvitationById = findById;
export const findInvitationByIdWithSender = findByIdWithSender;
export const findExistingPendingInvitation = findExistingPending;
export const fetchActiveInvitations = findActiveIncoming;
