import jwt from 'jsonwebtoken';
import { findUserById, updateRefreshToken } from '../../repositories/index.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokenUtils.js';

// POST /auth/refresh
export const refreshTokenService = async (token) => {
  if (!token) { const err = new Error('No token provided'); err.status = 401; throw err; }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await findUserById(decoded.id);

  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }
  if (user.refreshToken !== token) { const err = new Error('Invalid refresh token'); err.status = 400; throw err; }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Rotate the refresh token
  await updateRefreshToken(user._id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
