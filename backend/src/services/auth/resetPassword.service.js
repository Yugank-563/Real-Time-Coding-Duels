import bcryptjs from 'bcryptjs';
import redis from '../../config/redis.js';
import { findUserByEmail, updateUserById } from '../../repositories/index.js';

// POST /auth/verify-reset-otp
export const verifyResetOTPService = async (email, otp) => {
  const emailLower = email.toLowerCase();
  const user = await findUserByEmail(emailLower);

  if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }

  const otpHash = await redis.get(`forgot-password:${emailLower}`);

  if (!otpHash) {
    { const err = new Error('Reset code has expired or was not requested. Please request a new one.'); err.status = 401; throw err; }
  }

  const valid = await bcryptjs.compare(otp, otpHash);

  if (!valid) { const err = new Error('Invalid reset code'); err.status = 401; throw err; }

  return user;
};

// POST /auth/reset-password
export const resetPasswordService = async (email, otp, newPassword) => {
  const emailLower = email.toLowerCase();
  
  const user = await verifyResetOTPService(emailLower, otp);

  const passwordHash = await bcryptjs.hash(newPassword, 10);

  await updateUserById(user._id, {
    passwordHash, // Using correct DB field "passwordHash" matching User.js model schema
  });

  await redis.del(`forgot-password:${emailLower}`);

  return { message: 'Password has been reset successfully' };
};
