import redis from '../../config/redis.js';
import topicMap from '../../config/topicMap.js';
import { countBattles } from '../../repositories/index.js';

export const getTopicsService = async () => {
  const topics = Object.keys(topicMap);
  const stats = {};
  for (const topic of topics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
    
    // Check both ranked and casual queues for this topic
    const rankedKey = `matchmaking:queue:ranked:topic:${normalizedTopic}`;
    const casualKey = `matchmaking:queue:casual:topic:${normalizedTopic}`;
    
    const rankedCount = await redis.zCard(rankedKey) || 0;
    const casualCount = await redis.zCard(casualKey) || 0;
    
    // Check for active battles matching this exact topic
    const activeBattles = await countBattles({ battleType: 'topic', status: 'active', topic: topic });
    
    stats[topic] = rankedCount + casualCount + (activeBattles * 2);
  }
  return { topics, stats };
};
