import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;

// Setup highly robust connection configuration supporting standard and secure SSL (Upstash) connections
const connectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Use secure connection configurations for secure TLS redis urls (Upstash rediss://)
if (redisUrl.startsWith('rediss://')) {
  connectionOptions.tls = {
    rejectUnauthorized: false,
  };
}

const ioRedisConnection = new Redis(redisUrl, connectionOptions);

ioRedisConnection.on('error', (err) => console.error('BullMQ Redis Connection Error:', err.message));
// Create the submission Queue
export const submissionQueue = new Queue('submission-queue', {
  connection: ioRedisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

console.log('BullMQ Queue initialized successfully');
