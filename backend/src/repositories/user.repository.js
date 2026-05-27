import User from '../models/User.js';

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

// Hard delete user
export const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

// Search users by name or email, excluding a specific ID
export const searchUsersByNameOrEmail = async (q, excludeId) => {
  return await User.find({
    $or: [
      { name: { $regex: q.trim(), $options: 'i' } },
      { email: { $regex: q.trim(), $options: 'i' } }
    ],
    _id: { $ne: excludeId }
  })
  .limit(5)
  .select('name email rank xp level');
};

