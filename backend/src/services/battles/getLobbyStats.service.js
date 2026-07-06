import redis from '../../config/redis.js';
import { countBattles } from '../../repositories/index.js';

export const getLobbyStatsService = async () => {
  const getCount = async (mode, battleType) => {
    let queueSize = 0;
    if (battleType === 'topic-duel') {
      const keys = await redis.keys(`matchmaking:queue:${mode}:topic:*`) || [];
      for (const key of keys) {
        queueSize += await redis.zCard(key) || 0;
      }
    } else {
      queueSize = await redis.zCard(`matchmaking:queue:${mode}:${battleType}`) || 0;
    }
    const activeBattles = await countBattles({ battleType, status: 'active', mode });
    return queueSize + activeBattles * 2;
  };

  const rankedCount = (await getCount('ranked', 'random-duel')) + (await getCount('casual', 'random-duel'));
  const sprintCount = (await getCount('ranked', 'timed-sprint')) + (await getCount('casual', 'timed-sprint'));
  const topicCount = (await getCount('ranked', 'topic-duel')) + (await getCount('casual', 'topic-duel'));



  return {
    ranked: rankedCount,
    'timed-sprint': sprintCount,
    topic: topicCount
  };
};
