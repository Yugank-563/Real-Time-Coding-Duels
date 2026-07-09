import { resendOTPService } from '../../services/index.js';

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await resendOTPService(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
