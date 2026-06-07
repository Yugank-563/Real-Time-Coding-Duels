import { removeFromTopicQueue, removeFromQueue } from '../../services/index.js';

export const leaveQueue = async (req, res) => {
  try {
    const { battleType, topic, teamId } = req.body;
    if (!battleType) {
      return res.status(400).json({ message: 'battleType parameter is required.' });
    }

    if (battleType === 'topic') {
      if (!topic) {
        return res.status(400).json({ message: 'topic parameter is required.' });
      }
      await removeFromTopicQueue(req.userId, topic);
    } else {
      await removeFromQueue(req.userId, battleType);
    }
    res.status(200).json({ message: 'Successfully left matchmaking queue' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
