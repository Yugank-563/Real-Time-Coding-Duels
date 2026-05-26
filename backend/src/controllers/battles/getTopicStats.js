import { getTopicStatsService } from '../../services/battles/index.js';

export const getTopicStats = async (req, res) => {
  try {
    const stats = await getTopicStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
