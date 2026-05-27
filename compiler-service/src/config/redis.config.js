import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

if (redisUrl.startsWith('rediss://')) {
  connectionOptions.tls = {
    rejectUnauthorized: false,
  };
}

export const redisConnection = new Redis(redisUrl, connectionOptions);
export const pubClient = new Redis(redisUrl, connectionOptions);

redisConnection.on('error', (err) => console.error('Redis Connection Error:', err.message));
pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err.message));
