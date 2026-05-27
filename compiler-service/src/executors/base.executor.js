export class BaseExecutor {
  /**
   * Execute code against a series of test cases.
   * @param {string} code - Target code to run
   * @param {string} language - Target language
   * @param {Array} testCases - Array of test case objects
   * @returns {Promise<Object>} - Execution result object
   */
  async execute(code, language, testCases) {
    throw new Error('execute() method must be implemented by concrete Executor class');
  }
}
export default BaseExecutor;
