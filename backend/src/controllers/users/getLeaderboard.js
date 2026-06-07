import { getLeaderboardDataService } from '../../services/index.js';

export const getLeaderboard = async (req, res) => {
  try {
    const {
      page    = 1,
      limit   = 20,
      search  = '',
      sort    = 'rank',
      order   = 'desc',
      country = '',
    } = req.query;

    const leaderboardData = await getLeaderboardDataService({
      page,
      limit,
      search,
      sort,
      order,
      country,
      currentUserId: req.userId,
    });

    res.status(200).json(leaderboardData);
  } catch (err) {
    console.error('[leaderboard] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
