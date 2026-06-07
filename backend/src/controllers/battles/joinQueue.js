import { findUserById } from '../../repositories/index.js';
import { handleTopicQueue, addToQueue } from '../../services/index.js';

export const joinQueue = async (req, res) => {
  try {
    const { battleType, topic, teamId } = req.body;
    if (!battleType) {
      return res.status(400).json({ message: 'battleType parameter is required.' });
    }

    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const elo = user.rank || 1200;

    if (battleType === 'topic') {
      if (!topic) {
        return res.status(400).json({ message: 'topic parameter is required for topic battles.' });
      }
      await handleTopicQueue(req.userId, elo, topic);
      res.status(200).json({ message: 'Successfully joined topic queue', elo, battleType, topic });
    } else {
      await addToQueue(req.userId, elo, battleType);
      res.status(200).json({ message: 'Successfully joined matchmaking queue', elo, battleType });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
