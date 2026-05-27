import User from '../../models/User.js';

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.name || user.email.split('@')[0],
      role: user.role,
      rating: user.rank || 1200,
      xp: user.xp || 0,
      level: user.level || 1,
      streaks: user.streaks || 0,
      badges: user.badges || [],
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
