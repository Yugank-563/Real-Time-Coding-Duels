import { User } from '../models/index.js';
import { escapeRegex } from '../utils/regexUtils.js';

const PUBLIC_USER_SELECT = '-passwordHash -refreshToken';

// Create
export const create = (data) => User.create(data);


// Find
export const findById = (id) => User.findById(id);

export const findByEmail = (email) => User.findOne({ email });

export const findByUsername = (username) => User.findOne({ username });

export const findByRefreshToken = (token) => User.findOne({ refreshToken: token });

export const findByUsernameSafe = (username) => 
  User.findOne({ username }).select(PUBLIC_USER_SELECT).lean();


// Search
export const searchByNameOrEmail = (q, excludeId) => {
  const safeQ = escapeRegex(q?.trim() || '');
  
  if (!safeQ) {
    return Promise.resolve([]);
  }

  return User.find({
    $or: [
      { username: { $regex: safeQ, $options: 'i' } },
      { name: { $regex: safeQ, $options: 'i' } },
      { email: { $regex: safeQ, $options: 'i' } }
    ],
    _id: { $ne: excludeId }
  })
  .select('username name email rank')
  .limit(5)
  .lean();
};

// Update
export const updateById = (id, update) => 
  User.findByIdAndUpdate(id, update, { new: true });

export const updateRefreshToken = (id, token) => 
  User.findByIdAndUpdate(id, { refreshToken: token }, { new: true });


// Backward Compatibility Aliases
export const createUser = create;
export const findUserById = findById;
export const findUserByEmail = findByEmail;
export const findUserByUsername = findByUsername;
export const findUserByRefreshToken = findByRefreshToken;
export const findUserByUsernameExcludingPassword = findByUsernameSafe;
export const searchUsersByNameOrEmail = searchByNameOrEmail;
export const updateUserById = updateById;
