import { getProfileService } from '../../services/index.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getProfileService(req.params.username);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
}
};