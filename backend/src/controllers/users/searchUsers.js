import { searchUsersService } from '../../services/index.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await searchUsersService(q, req.userId);
    res.status(200).json(results);
  } catch (error) {
    next(error);
}
};
