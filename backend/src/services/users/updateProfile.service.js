import User from '../../models/User.js';

const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
};

export const updateProfileService = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  // 0. Username
  if (profileData.username !== undefined) {
    const desiredUsername = sanitizeText(profileData.username).toLowerCase();
    const validPattern = /^[a-zA-Z0-9_]{3,25}$/;
    if (!validPattern.test(desiredUsername)) {
      throw new Error('Username must be 3-25 characters and contain only letters, numbers, and underscores.');
    }
    const existing = await User.findOne({ username: desiredUsername });
    if (existing && existing._id.toString() !== userId.toString()) {
      throw new Error('Username is already taken.');
    }
    user.username = desiredUsername;
  }

  // 1. Personal Information
  if (profileData.name !== undefined) {
    user.name = sanitizeText(profileData.name);
  }
  if (profileData.bio !== undefined) {
    user.bio = sanitizeText(profileData.bio);
  }
  if (profileData.country !== undefined) {
    user.country = sanitizeText(profileData.country);
  }

  await user.save();
  return user;
};
