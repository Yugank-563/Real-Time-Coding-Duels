import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTPEmail } from '../../utils/email.js';
import { findUserByEmail } from '../../repositories/index.js';
import redis from '../../config/redis.js';

// POST /auth/register
export const registerService = async (email, password) => {
  const emailLower = email.toLowerCase();

  const existing = await findUserByEmail(emailLower);
  if (existing) { const err = new Error('User already exists'); err.status = 409; throw err; }

  const passwordHash = await bcrypt.hash(password, 10);

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  const payload = JSON.stringify({ passwordHash, role: 'user', otpHash });
  
  // Store in Redis (10 minutes expiry)
  await redis.set(`register:${emailLower}`, payload, { EX: 600 });

  const name = emailLower.split('@')[0].split('.')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  await sendOTPEmail(emailLower, otp, formattedName);

  return { message: 'OTP sent to email' };
};
