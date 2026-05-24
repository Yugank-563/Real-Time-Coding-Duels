import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, updateRefreshToken } from '../../repositories/index.js';

// POST /auth/login
export const loginService = async (email, password) => {
  email = email.toLowerCase();
  const user = await findUserByEmail(email);

  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');

  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '7d',
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  });

  await updateRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken, user };
};
