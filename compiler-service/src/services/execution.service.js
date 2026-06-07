import Problem from '../../../backend/src/models/Problem.js';
import Submission from '../../../backend/src/models/Submission.js';
import TestCase from '../../../backend/src/models/TestCase.js';
import { driverFactory } from '../drivers/driver.factory.js';
import { executorFactory } from '../executors/executor.factory.js';
import { battleService } from './battle.service.js';
import { publishSubmissionResult, publishSubmissionProgress } from '../pubsub/publisher.js';
import logger from '../utils/logger.js';

export class ExecutionService {
  /**
   * Orchestrates the complete execution pipeline.
   *
   * jobData may include:
   *   { submissionId, code, language, problemId, testCases }
   *
   * If testCases is supplied (from backend route after auto-generation),
   * they are used directly. Otherwise we fall back to the problem's stored
   * sample test cases.
   *
   * Uses Judge0 batch API when more than 1 TC is present.
   */
  async runPipeline(jobData) {
    const { submissionId, code, language, problemId, testCases: incomingTCs } = jobData;
    logger.info(`[ExecutionService] Pipeline start → submission ${submissionId}`);

    try {
      // 1. Fetch problem details
      const problem = await Problem.findById(problemId);
      const problemTitle = problem ? problem.title : '';

      // 2. Determine test cases to run
      let testCases = incomingTCs || [];
      
      // If none explicitly passed but they exist in DB, fetch them
      if (!testCases.length && problem?.hasHiddenTestCases) {
        const tcs = await TestCase.find({ problemId: problem._id }).sort({ caseNumber: 1 });
        testCases = tcs.map(tc => ({
          input: tc.input,
          output: tc.output,
          caseNumber: tc.caseNumber,
          type: tc.type,
        }));
      }

      // Fallback to sample test cases
      if (!testCases.length) {
        testCases = (problem?.testCases || []).map((tc, i) => ({
            input:      tc.input,
            output:     tc.output || '',
            caseNumber: i + 1,
            type:       tc.isSample ? 'sample' : 'hidden',
          }));
      }

      if (!testCases.length) {
        logger.warn(`[ExecutionService] No test cases for submission ${submissionId}`);
      }

      // 3. Wrap user code via language driver
      const driver = driverFactory.getDriver(language);
      const processedCode = driver ? driver.wrap(code, problemTitle) : code;

      // 4. Execute — use batch path for multiple TCs, sequential for one
      const executor = executorFactory.getExecutor();
      let executionResult;

      if (testCases.length > 1 && typeof executor.executeBatch === 'function') {
        // Progress callback: publish an event so the frontend can show a progress bar
        const onProgress = async (done, total) => {
          await publishSubmissionProgress(submissionId, jobData.userId, done, total).catch(() => {});
        };
        executionResult = await executor.executeBatch(processedCode, language, testCases, onProgress);
      } else {
        executionResult = await executor.execute(processedCode, language, testCases);
      }

      // 5. Persist result to MongoDB
      const submission = await Submission.findByIdAndUpdate(
        submissionId,
        {
          verdict:          executionResult.verdict,
          executionTime:    executionResult.executionTime,
          memory:           executionResult.memory,
          testCasesPassed:  executionResult.testCasesPassed,
          totalTestCases:   testCases.length,
          errorMessage:     executionResult.errorMessage,
          output:           executionResult.output || '',
          // Persist per-case results so the polling backend can relay them
          results:          executionResult.results || [],
        },
        { new: true }
      );

      logger.info(`[ExecutionService] Submission ${submissionId} → ${executionResult.verdict} (${executionResult.testCasesPassed}/${testCases.length})`);

      // 6. Update battle state if submission is part of a match
      if (submission?.battleId) {
        await battleService.updateBattleState(
          submission.battleId,
          submission.userId,
          language,
          executionResult.verdict,
          executionResult.testCasesPassed
        );
      }

      // 7. Broadcast final submission result via Redis pub/sub → socket-service
      await publishSubmissionResult(
        submissionId,
        submission?.userId,
        submission?.battleId,
        executionResult.verdict,
        executionResult.testCasesPassed,
        testCases.length,
        executionResult.results || []
      );

      return executionResult;
    } catch (err) {
      logger.error(`[ExecutionService] Pipeline failed on submission ${submissionId}:`, err.stack);

      try {
        await Submission.findByIdAndUpdate(submissionId, {
          verdict:      'RE',
          errorMessage: err.message,
        });
      } catch (dbErr) {
        logger.error(`[ExecutionService] DB recovery update failed:`, dbErr.message);
      }

      throw err;
    }
  }
}

export const executionService = new ExecutionService();
export default executionService;
