import { User } from '../models/index.js';
import { escapeRegex } from '../utils/regexUtils.js';

// Create a new user
export const createUser = async (data) => {
  return await User.create(data);
};

// Find user by email
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Find user by MongoDB ObjectId
export const findUserById = async (id) => {
  return await User.findById(id);
};

// Find user by refresh token
export const findUserByRefreshToken = async (token) => {
  return await User.findOne({ refreshToken: token });
};

// Update user details
export const updateUserById = async (id, update) => {
  return await User.findByIdAndUpdate(id, update, { returnDocument: 'after' });
};

// Store or clear refresh token
export const updateRefreshToken = async (id, token) => {
  return await User.findByIdAndUpdate(id, { refreshToken: token }, { returnDocument: 'after' });
};


// Search users by name, username or email, excluding a specific ID
export const searchUsersByNameOrEmail = async (q, excludeId) => {
  const safeQ = escapeRegex(q.trim());
  return await User.find({
    $or: [
      { username: { $regex: safeQ, $options: 'i' } },
      { name: { $regex: safeQ, $options: 'i' } },
      { email: { $regex: safeQ, $options: 'i' } }
    ],
    _id: { $ne: excludeId }
  })
  .limit(5)
  .select('username name email rank');
};

