import BaseExecutor from './base.executor.js';
import { VERDICTS } from '../config/constants.js';
import logger from '../utils/logger.js';

export class MockExecutor extends BaseExecutor {
  async execute(code, language, testCases) {
    logger.info('Running mock execution engine fallback...');
    let passedCount = 0;
    
    // Basic syntax validation
    const hasBasicStructure = code.includes('class ') || code.includes('#include') || code.includes('int main');

    if (!hasBasicStructure) {
      return {
        verdict: VERDICTS.CE,
        executionTime: 0,
        memory: 0,
        testCasesPassed: 0,
        errorMessage: 'Compilation Error: Missing standard programming constructs or entrypoints.',
      };
    }

    // Simulate executing test cases
    for (let i = 0; i < testCases.length; i++) {
      if (Math.random() < 0.95) {
        passedCount++;
      }
    }

    const verdict = passedCount === testCases.length ? VERDICTS.AC : VERDICTS.WA;

    return {
      verdict,
      executionTime: Math.round(15 + Math.random() * 85),
      memory: Math.round(4000 + Math.random() * 2000),
      testCasesPassed: passedCount,
      errorMessage: verdict === VERDICTS.WA ? `Wrong Answer on testcase #${passedCount + 1}` : '',
    };
  }
}

export default MockExecutor;
