import { findUserById, findUserByUsername, updateUserById } from '../../repositories/index.js';

const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

export const updateProfileService = async (userId, profileData) => {
  const user = await findUserById(userId);
  if (!user) {
    { const err = new Error('User not found.'); err.status = 404; throw err; }
  }

  const updatePayload = {};

  // 0. Username
  if (profileData.username !== undefined) {
    const desiredUsername = sanitizeText(profileData.username).toLowerCase();
    const validPattern = /^[a-zA-Z0-9_]{3,25}$/;
    if (!validPattern.test(desiredUsername)) {
      { const err = new Error('Username must be 3-25 characters and contain only letters, numbers, and underscores.'); err.status = 400; throw err; }
    }
    const existing = await findUserByUsername(desiredUsername);
    if (existing && existing._id.toString() !== userId.toString()) {
      { const err = new Error('Username is already taken.'); err.status = 409; throw err; }
    }
    updatePayload.username = desiredUsername;
  }

  // 1. Personal Information
  if (profileData.name !== undefined) {
    updatePayload.name = sanitizeText(profileData.name);
  }
  if (profileData.bio !== undefined) {
    updatePayload.bio = sanitizeText(profileData.bio);
  }
  if (profileData.country !== undefined) {
    updatePayload.country = sanitizeText(profileData.country);
  }

  if (Object.keys(updatePayload).length > 0) {
    const updatedUser = await updateUserById(userId, updatePayload);
    return updatedUser;
  }

  return user;
};
