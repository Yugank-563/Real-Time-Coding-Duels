import { sendOTPEmail } from '../../utils/email.js';
import redis from '../../config/redis.js';
import { generateOTP, formatNameFromEmail } from '../../utils/otpUtils.js';

// POST /auth/resend-otp
export const resendOTPService = async (email) => {
  const emailLower = email.toLowerCase();

  const existing = await redis.get(`register:${emailLower}`);
  if (!existing) {
    const err = new Error('No pending registration found. Please register again.');
    err.status = 404;
    throw err;
  }

  const data = JSON.parse(existing);
  const { otp, otpHash } = await generateOTP();
  
  const updated = JSON.stringify({ ...data, otpHash });
  await redis.set(`register:${emailLower}`, updated, { EX: 600 });

  const formattedName = formatNameFromEmail(emailLower);

  await sendOTPEmail(emailLower, otp, formattedName);

  return { message: 'OTP resent successfully' };
};
