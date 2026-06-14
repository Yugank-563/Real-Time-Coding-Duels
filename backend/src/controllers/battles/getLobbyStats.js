import { getLobbyStatsService } from '../../services/index.js';

export const getLobbyStats = async (req, res, next) => {
  try {
    const stats = await getLobbyStatsService();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
}
};
