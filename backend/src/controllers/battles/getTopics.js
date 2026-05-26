import { getTopicsService } from '../../services/battles/index.js';

export const getTopics = async (req, res) => {
  try {
    const result = await getTopicsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
