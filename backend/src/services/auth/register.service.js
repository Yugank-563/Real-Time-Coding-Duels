import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../../utils/email.js';
import { findUserByEmail } from '../../repositories/index.js';
import redis from '../../config/redis.js';
import { generateOTP, formatNameFromEmail } from '../../utils/otpUtils.js';

// POST /auth/register
export const registerService = async (email, password) => {
  const emailLower = email.toLowerCase();

  const existing = await findUserByEmail(emailLower);
  if (existing) { const err = new Error('User already exists'); err.status = 409; throw err; }

  const passwordHash = await bcrypt.hash(password, 10);

  const { otp, otpHash } = await generateOTP();

  const payload = JSON.stringify({ passwordHash, role: 'user', otpHash });
  
  // Store in Redis (10 minutes expiry)
  await redis.set(`register:${emailLower}`, payload, { EX: 600 });

  const formattedName = formatNameFromEmail(emailLower);

  await sendOTPEmail(emailLower, otp, formattedName);

  return { message: 'OTP sent to email' };
};
