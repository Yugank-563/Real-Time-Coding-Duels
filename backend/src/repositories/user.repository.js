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
