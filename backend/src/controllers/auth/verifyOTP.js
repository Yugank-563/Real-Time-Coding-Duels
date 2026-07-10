import { verifyOTPService } from '../../services/index.js';
import { formatUserDTO } from '../../utils/userDto.js';

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const { user, accessToken, refreshToken } = await verifyOTPService(email, otp);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      message: 'Email verified! Welcome to Coduelo',
      user: formatUserDTO(user),
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
