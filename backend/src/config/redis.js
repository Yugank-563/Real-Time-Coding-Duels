import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

const redis = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000, // 10 seconds to avoid transient connection timeouts
    reconnectStrategy: (retries) => {
      if(retries > 10) {
        return new Error('Redis connection lost permanently.');
      }
      const delay = Math.min(1000 * 2 ** retries, 30000);
      return delay;
    }
  }
});

redis.on('error', (err) => console.error('Redis Client Error:', err.message));
redis.on('ready', () => console.log('redis connected'));

try {
  await redis.connect();
} catch (err) {
  console.warn('Redis Connection failed on startup.');
}

export default redis;
