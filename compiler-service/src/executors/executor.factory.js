import Judge0Executor from './judge0.executor.js';
import LocalExecutor from './local.executor.js';

class ExecutorFactory {
  constructor() {
    this.judge0 = new Judge0Executor();
    this.local = new LocalExecutor();
  }

  /**
   * Get target execution strategy.
   * Configurable via EXECUTOR_TYPE env variable ('local', 'judge0').
   * Defaults to 'local' for fast, zero-latency execution.
   * @returns {BaseExecutor}
   */
  getExecutor() {
    const type = (process.env.EXECUTOR_TYPE || 'local').toLowerCase().trim();
    if (type === 'judge0')
      return this.judge0;
    
    return this.local;
  }
}

export const executorFactory = new ExecutorFactory();
export default executorFactory;
