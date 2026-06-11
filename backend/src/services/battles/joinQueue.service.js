import { findUserById } from '../../repositories/index.js';
import { handleTopicQueue, addToQueue } from '../matchmakingService.js';

export const joinQueueService = async (userId, battleType, topic) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const elo = user.rank || 1200;

  if (battleType === 'topic') {
    if (!topic) {
      const err = new Error('topic parameter is required for topic battles.');
      err.status = 400;
      throw err;
    }
    await handleTopicQueue(userId, elo, topic);
    return { message: 'Successfully joined topic queue', elo, battleType, topic };
  } else {
    await addToQueue(userId, elo, battleType);
    return { message: 'Successfully joined matchmaking queue', elo, battleType };
  }
};
