import redis from '../../config/redis.js';
import { countBattles } from '../../repositories/index.js';

export const getLobbyStatsService = async () => {
  const rankedQueueSize = await redis.zCard('matchmaking_queue') || 0;
  const activeRankedBattles = await countBattles({ battleType: '1v1', status: 'active' });
  const rankedCount = (rankedQueueSize + activeRankedBattles * 2) || 842;

  const activeSprintBattles = await countBattles({ battleType: 'sprint', status: 'active' });
  const sprintCount = (activeSprintBattles * 2) || 302;

  const topicKeys = await redis.keys('matchmaking_topic:*') || [];
  let topicQueuedCount = 0;
  for (const key of topicKeys) {
    topicQueuedCount += await redis.zCard(key) || 0;
  }
  const activeTopicBattles = await countBattles({ battleType: 'topic', status: 'active' });
  const topicCount = (topicQueuedCount + activeTopicBattles * 2) || 436;

  const activeCustomBattles = await countBattles({ battleType: 'custom', status: 'active' });
  const customCount = (activeCustomBattles * 2) || 110;

  return {
    ranked: rankedCount,
    sprint: sprintCount,
    topic: topicCount,
    custom: customCount
  };
};
