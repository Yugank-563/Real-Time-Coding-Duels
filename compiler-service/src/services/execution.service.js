import Problem from '../../../backend/src/models/Problem.js';
import Submission from '../../../backend/src/models/Submission.js';
import { driverFactory } from '../drivers/driver.factory.js';
import { executorFactory } from '../executors/executor.factory.js';
import { battleService } from './battle.service.js';
import { publishSubmissionResult } from '../pubsub/publisher.js';
import logger from '../utils/logger.js';

export class ExecutionService {
  /**
   * Orchestrates the complete execution pipeline.
   * @param {Object} jobData - Job payload from BullMQ
   * @returns {Promise<Object>} - Execution outcome results
   */
  async runPipeline(jobData) {
    const { submissionId, code, language, problemId, testCases } = jobData;
    logger.info(`Orchestrating execution pipeline for submission ${submissionId}...`);

    try {
      // 1. Fetch the problem details
      const problem = await Problem.findById(problemId);
      const problemTitle = problem ? problem.title : '';

      // 2. Wrap C++ user code dynamically via Strategy Drivers
      const driver = driverFactory.getDriver(language);
      const processedCode = driver ? driver.wrap(code, problemTitle) : code;

      // 3. Delegate execution to Strategy Executors
      const executor = executorFactory.getExecutor();
      const executionResult = await executor.execute(processedCode, language, testCases);

      // 4. Update the Submission in MongoDB
      const submission = await Submission.findByIdAndUpdate(
        submissionId,
        {
          verdict: executionResult.verdict,
          executionTime: executionResult.executionTime,
          memory: executionResult.memory,
          testCasesPassed: executionResult.testCasesPassed,
          errorMessage: executionResult.errorMessage,
        },
        { new: true }
      );

      logger.info(`Submission ${submissionId} evaluated. Verdict: ${executionResult.verdict}`);

      // 5. Update Battle state if submission is tied to a match
      if (submission && submission.battleId) {
        await battleService.updateBattleState(
          submission.battleId,
          submission.userId,
          language,
          executionResult.verdict,
          executionResult.testCasesPassed
        );
      }

      // 6. Broadcast direct submission feedback toast via Socket
      await publishSubmissionResult(
        submissionId,
        submission.userId,
        submission.battleId,
        executionResult.verdict,
        executionResult.testCasesPassed,
        submission.totalTestCases
      );

      return executionResult;
    } catch (err) {
      logger.error(`Execution pipeline failed on submission ${submissionId}:`, err.stack);
      
      // Fallback updates in MongoDB for failures
      try {
        await Submission.findByIdAndUpdate(submissionId, {
          verdict: 'RE',
          errorMessage: err.message,
        });
      } catch (dbErr) {
        logger.error(`Failed to execute recovery MongoDB updates:`, dbErr.message);
      }

      throw err;
    }
  }
}

export const executionService = new ExecutionService();
export default executionService;
