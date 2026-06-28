import Judge0Executor from './judge0.executor.js';
import MockExecutor from './mock.executor.js';
import LocalExecutor from './local.executor.js';


class ExecutorFactory {
  constructor() {
    this.judge0 = new Judge0Executor();
    this.mock = new MockExecutor();
    this.local = new LocalExecutor();
  }

  /**
   * Get target execution strategy.
   * Supports future integrations like Docker, Piston, etc.
   * @returns {BaseExecutor}
   */
  getExecutor() {
    // We are now defaulting to the LocalExecutor to bypass Judge0 RapidAPI
    // 50MB network payload limits and prevent crashing on massive test cases (e.g. 3Sum).
    return this.local;
  }
}

export const executorFactory = new ExecutorFactory();
export default executorFactory;
