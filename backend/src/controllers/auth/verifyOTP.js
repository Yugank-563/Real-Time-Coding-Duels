import { verifyOTPService } from '../../services/auth/index.js';

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if(!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const { user, accessToken, refreshToken } = await verifyOTPService(email, otp);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({
      message: 'Email verified! Welcome to BattleCode',
      user: {
        id: user._id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        name: user.name || '',
        role: user.role,
        rating: user.rank || 1200,
        xp: user.xp || 0,
        level: user.level || 1,
        streaks: user.streaks || 0,
        badges: user.badges || [],
        bio: user.bio || '',
        country: user.country || '',
        joinDate: user.createdAt,
      },
      token: accessToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
