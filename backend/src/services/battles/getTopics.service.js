import redis from '../../config/redis.js';
import { getDistinctTags } from '../../repositories/index.js';

export const getTopicsService = async () => {
  const topics = await getDistinctTags() || [];
  const stats = {};
  for (const topic of topics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
    const key = `matchmaking_topic:${normalizedTopic}`;
    const count = await redis.zCard(key) || 0;
    stats[topic] = count;
  }
  return { topics, stats };
};
