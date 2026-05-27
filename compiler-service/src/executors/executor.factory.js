import Judge0Executor from './judge0.executor.js';
import MockExecutor from './mock.executor.js';
import { judge0Config } from '../config/judge0.config.js';
import logger from '../utils/logger.js';

class ExecutorFactory {
  constructor() {
    this.judge0 = new Judge0Executor();
    this.mock = new MockExecutor();
  }

  /**
   * Get target execution strategy.
   * Supports future integrations like Docker, Piston, etc.
   * @returns {BaseExecutor}
   */
  getExecutor() {
    const { apiKey } = judge0Config;
    if (!apiKey || apiKey === 'your_rapidapi_key') {
      logger.warn('RapidAPI Judge0 API Key not detected or invalid. Falling back to local mockup execution engine.');
      return this.mock;
    }
    return this.judge0;
  }
}

export const executorFactory = new ExecutorFactory();
export default executorFactory;
