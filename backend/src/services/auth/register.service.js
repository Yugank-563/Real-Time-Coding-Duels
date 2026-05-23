import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../../utils/email.js';
import { findUserByEmail } from '../../repositories/index.js';
import redis from '../../config/redis.js';

// POST /auth/register
export const registerService = async (email, password) => {
  if (!email || !password) throw new Error('Email and password required');

  const emailLower = email.toLowerCase();

  const existing = await findUserByEmail(emailLower);
  if (existing) throw new Error('User already exists');

  // Basic email pattern validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    throw new Error('Invalid email address format');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = await bcrypt.hash(otp, 10);

  const payload = JSON.stringify({ passwordHash, role: 'user', otpHash });
  
  // Store in Redis (10 minutes expiry)
  await redis.set(`register:${emailLower}`, payload, { EX: 600 });

  const name = emailLower.split('@')[0].split('.')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  await sendOTPEmail(emailLower, otp, formattedName);

  return { message: 'OTP sent to email' };
};
