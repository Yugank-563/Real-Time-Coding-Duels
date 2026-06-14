import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import redis from '../../config/redis.js';
import { sendPasswordResetEmail } from '../../utils/email.js';
import { findUserByEmail } from '../../repositories/index.js';

// POST /auth/forgot-password
export const forgotPasswordService = async (email) => {
  const emailLower = email.toLowerCase();
  const user = await findUserByEmail(emailLower);

  if (!user) {
    const err = new Error('No account found with that email address');
    err.status = 404;
    throw err;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcryptjs.hash(otp, 10);

  // Set OTP in redis with a 10-minute expiry (600 seconds)
  await redis.set(`forgot-password:${emailLower}`, otpHash, { EX: 600 });

  const name = emailLower.split('@')[0].split('.')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  await sendPasswordResetEmail(emailLower, otp, formattedName);

  return { message: 'Password reset OTP sent to your email' };
};
