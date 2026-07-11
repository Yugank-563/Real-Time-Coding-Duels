import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  createUser,
  updateRefreshToken,
} from '../../repositories/index.js';
import redis from '../../config/redis.js';
import { generateAuthTokens } from '../../utils/tokenUtils.js';

// POST /auth/verify-otp
export const verifyOTPService = async (email, otp) => {
  const emailLower = email.toLowerCase();

  const existingUser = await findUserByEmail(emailLower);
  if (existingUser) { const err = new Error('User already registered'); err.status = 409; throw err; }

  const payloadStr = await redis.get(`register:${emailLower}`);
  if (!payloadStr) { const err = new Error('OTP expired or not requested'); err.status = 401; throw err; }

  const payload = JSON.parse(payloadStr);

  const valid = await bcrypt.compare(otp, payload.otpHash);
  if (!valid) { const err = new Error('Invalid OTP'); err.status = 401; throw err; }

  let name = emailLower.split('@')[0].split('.')[0];
  name = name.charAt(0).toUpperCase() + name.slice(1);

  const user = await createUser({
    email: emailLower,
    username: name.toLowerCase() + Math.floor(Math.random() * 1000), // generate a unique username
    name: name,
    passwordHash: payload.passwordHash,
    isVerified: true,
  });

  await redis.del(`register:${emailLower}`);

  const { accessToken, refreshToken } = generateAuthTokens(user);

  await updateRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};
