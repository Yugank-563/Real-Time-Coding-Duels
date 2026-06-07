import redis from '../../config/redis.js';
import topicMap from '../../config/topicMap.js';

export const getTopicsService = async () => {
  const topics = Object.keys(topicMap);
  const stats = {};
  for (const topic of topics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
    const key = `matchmaking_topic:${normalizedTopic}`;
    const count = await redis.zCard(key) || 0;
    stats[topic] = count;
  }
  return { topics, stats };
};
