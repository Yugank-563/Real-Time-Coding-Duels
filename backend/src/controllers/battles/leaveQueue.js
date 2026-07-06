import { removeFromTopicQueue, removeFromQueue } from '../../services/index.js';

export const leaveQueue = async (req, res, next) => {
  try {
    const { battleType, topic, mode = 'ranked' } = req.body;
    if (!battleType) {
      return res.status(400).json({ message: 'battleType parameter is required.' });
    }

    if (battleType === 'topic-duel') {
      if (!topic) {
        return res.status(400).json({ message: 'topic parameter is required.' });
      }
      await removeFromTopicQueue(req.userId, topic, mode);
    } else {
      await removeFromQueue(req.userId, battleType, mode);
    }
    res.status(200).json({ message: 'Successfully left matchmaking queue' });
  } catch (error) {
    next(error);
}
};
