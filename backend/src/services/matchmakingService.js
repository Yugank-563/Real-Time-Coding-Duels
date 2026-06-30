import redis from '../config/redis.js';

export const getQueueKey = (mode, battleType, topic) => {
  if (battleType === 'topic') {
    const normalizedTopic = topic ? topic.toLowerCase().replace(/\s+/g, '_') : 'default';
    return `matchmaking:queue:${mode}:topic:${normalizedTopic}`;
  }
  return `matchmaking:queue:${mode}:${battleType}`;
};

/**
 * Adds a user to the matchmaking queue.
 */
export const addToQueue = async (userId, elo, battleType, mode = 'ranked') => {
  const queueKey = getQueueKey(mode, battleType);
  await redis.zAdd(queueKey, {
    score: elo,
    value: userId,
  });
  console.log(`Added user ${userId} (${elo}) to ${mode} ${battleType} queue`);
};

/**
 * Removes a user from the matchmaking queue.
 */
export const removeFromQueue = async (userId, battleType, mode = 'ranked') => {
  const queueKey = getQueueKey(mode, battleType);
  await redis.zRem(queueKey, userId);
  console.log(`Removed user ${userId} from ${mode} ${battleType} queue`);
};

/**
 * Searches for a match for a user inside the Redis sorted set.
 */
export const findMatch = async (userId, elo, battleType, mode = 'ranked', tolerance = 100) => {
  const queueKey = getQueueKey(mode, battleType);
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  // Retrieve players in the Elo range
  const candidates = await redis.zRangeByScore(queueKey, minScore, maxScore);

  for (const candidate of candidates) {
    if (candidate !== userId) {
      // Get opponent score before removing for accurate gap logging
      const candidateScore = await redis.zScore(queueKey, candidate);
      const eloGap = candidateScore !== null ? Math.abs(elo - Number(candidateScore)) : 0;

      // Dequeue both from the queue
      await redis.zRem(queueKey, userId);
      await redis.zRem(queueKey, candidate);
      
      console.log(`Matched user ${userId} with user ${candidate} in ${mode} ${battleType} (Elo gap: ${eloGap})`);
      return candidate;
    }
  }

  return null;
};

/**
 * Get current position and wait stats for queue.
 */
export const getQueuePosition = async (userId, battleType, mode = 'ranked') => {
  const queueKey = getQueueKey(mode, battleType);
  const rank = await redis.zRank(queueKey, userId);
  const size = await redis.zCard(queueKey);
  
  return {
    position: rank !== null ? rank + 1 : -1,
    totalQueued: size,
  };
};

/**
 * Adds a user to a topic matchmaking queue.
 */
export const handleTopicQueue = async (userId, elo, topic, mode = 'ranked') => {
  const queueKey = getQueueKey(mode, 'topic', topic);
  await redis.zAdd(queueKey, {
    score: elo,
    value: userId,
  });
  
  // Track join timestamp for stale cleanup (5 mins)
  await redis.hSet('matchmaking_topic_timestamps', `${userId}:${queueKey}`, Date.now().toString());
  console.log(`Added user ${userId} (${elo}) to ${mode} topic queue for: ${topic}`);
};

/**
 * Removes a user from a topic matchmaking queue.
 */
export const removeFromTopicQueue = async (userId, topic, mode = 'ranked') => {
  const queueKey = getQueueKey(mode, 'topic', topic);
  await redis.zRem(queueKey, userId);
  await redis.hDel('matchmaking_topic_timestamps', `${userId}:${queueKey}`);
  console.log(`Removed user ${userId} from ${mode} topic queue: ${topic}`);
};

/**
 * Searches for a match within a specific topic sorted set.
 */
export const findTopicMatch = async (userId, elo, topic, mode = 'ranked', tolerance = 150) => {
  const queueKey = getQueueKey(mode, 'topic', topic);
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  const candidates = await redis.zRangeByScore(queueKey, minScore, maxScore);

  for (const candidate of candidates) {
    if (candidate !== userId) {
      // Matched! Dequeue both
      await redis.zRem(queueKey, userId);
      await redis.zRem(queueKey, candidate);
      await redis.hDel('matchmaking_topic_timestamps', `${userId}:${queueKey}`);
      await redis.hDel('matchmaking_topic_timestamps', `${candidate}:${queueKey}`);
      console.log(`Matched ${mode} topic queue user ${userId} with user ${candidate} for: ${topic}`);
      return candidate;
    }
  }

  return null;
};

