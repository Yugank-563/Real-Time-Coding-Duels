import { loginService } from '../../services/index.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken, user } = await loginService(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({
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
