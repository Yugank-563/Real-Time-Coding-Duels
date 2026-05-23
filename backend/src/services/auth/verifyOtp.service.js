import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  createUser,
  updateRefreshToken,
} from '../../repositories/index.js';
import redis from '../../config/redis.js';

// POST /auth/verify-otp
export const verifyOTPService = async (email, otp) => {
  const emailLower = email.toLowerCase();

  const existingUser = await findUserByEmail(emailLower);
  if (existingUser) throw new Error('User already verified and registered');

  const payloadStr = await redis.get(`register:${emailLower}`);
  if (!payloadStr) throw new Error('OTP expired or not requested');

  const payload = JSON.parse(payloadStr);

  const valid = await bcrypt.compare(otp, payload.otpHash);
  if (!valid) throw new Error('Invalid OTP');

  let name = emailLower.split('@')[0].split('.')[0];
  name = name.charAt(0).toUpperCase() + name.slice(1);

  const user = await createUser({
    email: emailLower,
    name: name,
    passwordHash: payload.passwordHash,
    role: payload.role,
    isVerified: true,
  });

  await redis.del(`register:${emailLower}`);

  // Generate JWT Access & Refresh Token pair
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });

  await updateRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};
