import bcrypt from 'bcryptjs';
import { findUserByEmail, updateRefreshToken } from '../../repositories/index.js';
import { generateAuthTokens } from '../../utils/tokenUtils.js';

// POST /auth/login
export const loginService = async (email, password) => {
  email = email.toLowerCase();
  const user = await findUserByEmail(email);

  if (!user) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

  const { accessToken, refreshToken } = generateAuthTokens(user);

  await updateRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken, user };
};
