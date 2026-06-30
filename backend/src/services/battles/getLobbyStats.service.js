import redis from '../../config/redis.js';
import { countBattles } from '../../repositories/index.js';

export const getLobbyStatsService = async () => {
  const getCount = async (mode, battleType) => {
    let queueSize = 0;
    if (battleType === 'topic') {
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

  const rankedCount = (await getCount('ranked', '1v1')) + (await getCount('casual', '1v1'));
  const sprintCount = (await getCount('ranked', 'sprint')) + (await getCount('casual', 'sprint'));
  const topicCount = (await getCount('ranked', 'topic')) + (await getCount('casual', 'topic'));

  // Custom is effectively deprecated but keeping it for safety
  const activeCustomBattles = await countBattles({ battleType: 'custom', status: 'active' });
  const customCount = (activeCustomBattles * 2);

  return {
    ranked: rankedCount,
    sprint: sprintCount,
    topic: topicCount,
    custom: customCount
  };
};
