import { updateProfileService } from '../../services/users/updateProfile.service.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User session not found.' });
    }

    const profileData = req.body;

    // Length and bounds validations
    if (profileData.name && profileData.name.length > 50) {
      return res.status(400).json({ message: 'Name cannot exceed 50 characters.' });
    }
    if (profileData.bio && profileData.bio.length > 250) {
      return res.status(400).json({ message: 'Bio cannot exceed 250 characters.' });
    }



    const updatedUser = await updateProfileService(userId, profileData);

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        username: updatedUser.username || updatedUser.email.split('@')[0],
        name: updatedUser.name || '',
        bio: updatedUser.bio || '',
        country: updatedUser.country || '',
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    if (error.message === 'Username is already taken.' || error.message.includes('Username must be')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};
