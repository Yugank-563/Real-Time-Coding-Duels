import { searchUsersService } from '../../services/users/index.js';

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchUsersService(q, req.userId);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
