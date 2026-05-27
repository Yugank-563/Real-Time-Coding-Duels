import logger from './utils/logger.js';
import './workers/submission.worker.js';

logger.info('Compiler Service submission worker loaded and initialized successfully.');
export { submissionWorker as default } from './workers/submission.worker.js';
