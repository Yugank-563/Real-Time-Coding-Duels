import redis from '../../config/redis.js';
import { sendPasswordResetEmail } from '../../utils/email.js';
import { findUserByEmail } from '../../repositories/index.js';
import { generateOTP, formatNameFromEmail } from '../../utils/otpUtils.js';

// POST /auth/forgot-password
export const forgotPasswordService = async (email) => {
  const emailLower = email.toLowerCase();
  const user = await findUserByEmail(emailLower);

  if (!user) {
    const err = new Error('No account found with that email address');
    err.status = 404;
    throw err;
  }

  const { otp, otpHash } = await generateOTP();

  // Set OTP in redis with a 10-minute expiry (600 seconds)
  await redis.set(`forgot-password:${emailLower}`, otpHash, { EX: 600 });

  const formattedName = formatNameFromEmail(emailLower);
  await sendPasswordResetEmail(emailLower, otp, formattedName);

  return { message: 'Password reset OTP sent to your email' };
};
