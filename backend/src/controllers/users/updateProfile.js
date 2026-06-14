import { updateProfileService } from '../../services/index.js';

export const updateProfile = async (req, res, next) => {
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
    next(error);
}
};
