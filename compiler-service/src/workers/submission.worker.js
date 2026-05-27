import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config.js';
import { executionService } from '../services/execution.service.js';
import logger from '../utils/logger.js';

export const submissionWorker = new Worker(
  'submission-queue',
  async (job) => {
    logger.info(`Incoming BullMQ Job: ${job.id}`);
    return await executionService.runPipeline(job.data);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

submissionWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

submissionWorker.on('failed', (job, err) => {
  logger.error(`Job ${job.id || 'unknown'} failed: ${err.message}`);
});

export default submissionWorker;
