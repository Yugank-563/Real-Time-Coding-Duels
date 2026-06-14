import { verifyResetOTPService, resetPasswordService } from '../../services/index.js';

export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    await verifyResetOTPService(email, otp);

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await resetPasswordService(email, otp, newPassword);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
