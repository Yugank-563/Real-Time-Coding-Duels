import redis from '../config/redis.js';

const QUEUE_KEY = 'matchmaking_queue';

/**
 * Adds a user to the matchmaking queue.
 * @param {string} userId
 * @param {number} elo
 * @param {string} battleType - '1v1', 'Ranked', 'Blind', etc.
 */
export const addToQueue = async (userId, elo, battleType) => {
  // Store as "userId:battleType" to support queuing for multiple formats
  const value = `${userId}:${battleType}`;
  await redis.zAdd(QUEUE_KEY, {
    score: elo,
    value: value,
  });
  console.log(`Added user ${userId} (${elo}) to ${battleType} queue`);
};

/**
 * Removes a user from the matchmaking queue.
 * @param {string} userId
 * @param {string} battleType
 */
export const removeFromQueue = async (userId, battleType) => {
  const value = `${userId}:${battleType}`;
  await redis.zRem(QUEUE_KEY, value);
  console.log(`Removed user ${userId} from ${battleType} queue`);
};

/**
 * Searches for a match for a user inside the Redis sorted set.
 * @param {string} userId
 * @param {number} elo
 * @param {string} battleType
 * @param {number} tolerance - maximum Elo difference
 * @returns {string|null} - Matched user ID or null
 */
export const findMatch = async (userId, elo, battleType, tolerance = 100) => {
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  // Retrieve players in the Elo range
  const candidates = await redis.zRangeByScore(QUEUE_KEY, minScore, maxScore);

  for (const candidate of candidates) {
    const [candId, candType] = candidate.split(':');
    
    // Match found if:
    // 1. Same battle type
    // 2. Not the same user
    if (candType === battleType && candId !== userId) {
      // Get opponent score before removing for accurate gap logging
      const candidateScore = await redis.zScore(QUEUE_KEY, candidate);
      const eloGap = candidateScore !== null ? Math.abs(elo - Number(candidateScore)) : 0;

      // Dequeue both from the queue
      const myValue = `${userId}:${battleType}`;
      await redis.zRem(QUEUE_KEY, myValue);
      await redis.zRem(QUEUE_KEY, candidate);
      
      console.log(`Matched user ${userId} with user ${candId} (Elo gap: ${eloGap})`);
      return candId;
    }
  }

  return null;
};

/**
 * Get current position and wait stats for queue.
 * @param {string} userId
 * @param {string} battleType
 */
export const getQueuePosition = async (userId, battleType) => {
  const value = `${userId}:${battleType}`;
  const rank = await redis.zRank(QUEUE_KEY, value);
  const size = await redis.zCard(QUEUE_KEY);
  
  return {
    position: rank !== null ? rank + 1 : -1,
    totalQueued: size,
  };
};

/**
 * Adds a user to a topic matchmaking queue.
 */
export const handleTopicQueue = async (userId, elo, topic) => {
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
  const key = `matchmaking_topic:${normalizedTopic}`;
  await redis.zAdd(key, {
    score: elo,
    value: userId,
  });
  
  // Track join timestamp for stale cleanup (5 mins)
  await redis.hSet('matchmaking_topic_timestamps', `${userId}:${normalizedTopic}`, Date.now().toString());
  console.log(`Added user ${userId} (${elo}) to topic queue for: ${topic}`);
};

/**
 * Removes a user from a topic matchmaking queue.
 */
export const removeFromTopicQueue = async (userId, topic) => {
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
  const key = `matchmaking_topic:${normalizedTopic}`;
  await redis.zRem(key, userId);
  await redis.hDel('matchmaking_topic_timestamps', `${userId}:${normalizedTopic}`);
  console.log(`Removed user ${userId} from topic queue: ${topic}`);
};

/**
 * Searches for a match within a specific topic sorted set.
 */
export const findTopicMatch = async (userId, elo, topic, tolerance = 150) => {
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
  const key = `matchmaking_topic:${normalizedTopic}`;
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  const candidates = await redis.zRangeByScore(key, minScore, maxScore);

  for (const candidate of candidates) {
    if (candidate !== userId) {
      // Matched! Dequeue both
      await redis.zRem(key, userId);
      await redis.zRem(key, candidate);
      await redis.hDel('matchmaking_topic_timestamps', `${userId}:${normalizedTopic}`);
      await redis.hDel('matchmaking_topic_timestamps', `${candidate}:${normalizedTopic}`);
      console.log(`Matched topic queue user ${userId} with user ${candidate} for: ${topic}`);
      return candidate;
    }
  }

  return null;
};

