import { User, Battle, Problem } from '../../models/index.js';
import { getLobbyStatsService } from '../../services/index.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    // Execute independent queries in parallel for better performance
    const [maxUser, battlesFought, problemsAvailable, lobbyStats] = await Promise.all([
      User.findOne({}, { rating: 1 }).sort({ rating: -1 }).lean(),
      Battle.countDocuments(),
      Problem.countDocuments(),
      getLobbyStatsService()
    ]);

    const maxRating = maxUser && maxUser.rating ? maxUser.rating : 0;
    
    // 4. Active Coders (using existing queue + active battles logic)
    const activeCoders = (lobbyStats?.ranked || 0) + (lobbyStats?.['timed-sprint'] || 0) + (lobbyStats?.topic || 0);

    res.status(200).json({
      maxRating,
      battlesFought,
      problemsAvailable,
      activeCoders
    });
  } catch (error) {
    next(error);
  }
};
