import { getProfileService } from '../../services/users/index.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await getProfileService(req.params.username);
    res.status(200).json(profile);
  } catch (error) {
    if (error.message === 'User not found.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
};