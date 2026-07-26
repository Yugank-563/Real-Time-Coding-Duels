import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

const redisOptions = {
  url: redisUrl,
  socket: {
    connectTimeout: 10000, // 10 seconds to avoid transient connection timeouts
    reconnectStrategy: (retries) => {
      if(retries > 10) {
        return new Error('Redis connection lost permanently.');
      }
      return Math.min(1000 * 2 ** retries, 30000);
    }
  }
};

if (redisUrl && redisUrl.startsWith('rediss://')) {
  redisOptions.socket.tls = true;
  redisOptions.socket.rejectUnauthorized = false;
}

const redis = createClient(redisOptions);

redis.on('error', (err) => console.error('Redis Client Error:', err.message));
redis.on('ready', () => console.log('redis connected'));

try {
  await redis.connect();
} catch (err) {
  console.warn('Redis Connection failed on startup.');
}

export default redis;
