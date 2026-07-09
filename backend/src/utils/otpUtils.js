import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOTP = async () => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  return { otp, otpHash };
};

export const formatNameFromEmail = (email) => {
  const name = email.split('@')[0].split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};
