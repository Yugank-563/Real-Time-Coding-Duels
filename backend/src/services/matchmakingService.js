import redis, { ensureRedisConnected } from '../config/redis.js';

export const getQueueKey = (mode, battleType, topic) => {
  if (battleType === 'topic-duel') {
    const normalizedTopic = topic ? topic.toLowerCase().replace(/\s+/g, '_') : 'default';
    return `matchmaking:queue:${mode}:topic:${normalizedTopic}`;
  }
  return `matchmaking:queue:${mode}:${battleType}`;
};

// Adds a user to the matchmaking queue.
export const addToQueue = async (userId, elo, battleType, mode = 'ranked') => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, battleType);
  await redis.zAdd(queueKey, {
    score: elo,
    value: userId,
  });
};

// Removes a user from the matchmaking queue.
export const removeFromQueue = async (userId, battleType, mode = 'ranked') => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, battleType);
  await redis.zRem(queueKey, userId);
};

// Searches for a match for a user inside the Redis sorted set.
export const findMatch = async (userId, elo, battleType, mode = 'ranked', tolerance = 100) => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, battleType);
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  // Retrieve players in the Elo range
  const candidates = await redis.zRangeByScore(queueKey, minScore, maxScore);

  for (const candidate of candidates) {
    if (candidate !== userId) {
      // Atomically check and dequeue both users
      const remUser = await redis.zRem(queueKey, userId);
      const remCandidate = await redis.zRem(queueKey, candidate);

      if (remUser > 0 && remCandidate > 0) {
        // Both were successfully dequeued by this invocation — WE WON THE RACE!
        return candidate;
      }

      // If we dequeued user but lost candidate, restore user to queue
      if (remUser > 0 && remCandidate === 0) {
        await redis.zAdd(queueKey, { score: elo, value: userId });
      }
    }
  }

  return null;
};

// Get current position and wait stats for queue.
export const getQueuePosition = async (userId, battleType, mode = 'ranked') => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, battleType);
  const rank = await redis.zRank(queueKey, userId);
  const size = await redis.zCard(queueKey);
  
  return {
    position: rank !== null ? rank + 1 : -1,
    totalQueued: size,
  };
};

// Adds a user to a topic matchmaking queue.
export const handleTopicQueue = async (userId, elo, topic, mode = 'ranked') => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, 'topic-duel', topic);
  await redis.zAdd(queueKey, {
    score: elo,
    value: userId,
  });
  
  // Track join timestamp for stale cleanup (5 mins)
  await redis.hSet('matchmaking_topic_timestamps', `${userId}:${queueKey}`, Date.now().toString());
};

// Removes a user from a topic matchmaking queue.
export const removeFromTopicQueue = async (userId, topic, mode = 'ranked') => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, 'topic-duel', topic);
  await redis.zRem(queueKey, userId);
  await redis.hDel('matchmaking_topic_timestamps', `${userId}:${queueKey}`);
};

// Searches for a match within a specific topic sorted set.
export const findTopicMatch = async (userId, elo, topic, mode = 'ranked', tolerance = 150) => {
  await ensureRedisConnected();
  const queueKey = getQueueKey(mode, 'topic-duel', topic);
  const minScore = elo - tolerance;
  const maxScore = elo + tolerance;

  const candidates = await redis.zRangeByScore(queueKey, minScore, maxScore);

  for (const candidate of candidates) {
    if (candidate !== userId) {
      // Atomically check and dequeue both users
      const remUser = await redis.zRem(queueKey, userId);
      const remCandidate = await redis.zRem(queueKey, candidate);

      if (remUser > 0 && remCandidate > 0) {
        await redis.hDel('matchmaking_topic_timestamps', `${userId}:${queueKey}`);
        await redis.hDel('matchmaking_topic_timestamps', `${candidate}:${queueKey}`);
        return candidate;
      }

      if (remUser > 0 && remCandidate === 0) {
        await redis.zAdd(queueKey, { score: elo, value: userId });
      }
    }
  }

  return null;
};

