import { getTopicStatsService } from '../../services/index.js';

export const getTopicStats = async (req, res, next) => {
  try {
    const stats = await getTopicStatsService();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
}
};
