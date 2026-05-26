import { getLobbyStatsService } from '../../services/battles/index.js';

export const getLobbyStats = async (req, res) => {
  try {
    const stats = await getLobbyStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
