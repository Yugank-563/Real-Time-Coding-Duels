import { getTestCases as getB2TestCases } from '../../../backend/src/services/testCaseService.js';
import { Problem, Submission } from '../../../backend/src/models/index.js';
import { driverFactory } from '../drivers/driver.factory.js';
import { executorFactory } from '../executors/executor.factory.js';
import { battleService } from './battle.service.js';
import { publishSubmissionResult, publishSubmissionProgress } from '../pubsub/publisher.js';
import logger from '../utils/logger.js';

export class ExecutionService {
  // Orchestrates the execution pipeline (uses Judge0 batch API when multiple TCs exist).
  async runPipeline(jobData) {
    const { submissionId, code, language, problemId, testCases: incomingTCs, isSubmit } = jobData;
    logger.info(`[ExecutionService] Pipeline start → submission ${submissionId}`);

    try {
      // 1. Fetch problem details
      const problem = await Problem.findById(problemId);
      const problemTitle = problem ? problem.title : '';

      // 2. Determine test cases to run
      let testCases = incomingTCs || [];

      // If test cases weren't sent over BullMQ (to save payload limit), fetch directly from B2
      if (!testCases.length && problem?.testCaseConfig?.folderPath) {
         const storedCases = await getB2TestCases(problem, 500); // Max 500 cases
         testCases = storedCases.map((tc) => ({
            input: tc.input,
            output: tc.expectedOutput,
            caseNumber: tc.caseNumber,
            type: 'hidden',
            isAnyOrder: problem.titleSlug === '3sum' || problem.titleSlug === 'two-sum'
         }));
      } else if (!testCases.length) {
         // Fallback to basic DB sample test cases if B2 is disabled
         testCases = (problem?.testCases || []).map((tc, i) => ({
            input:      tc.input,
            output:     tc.output || '',
            caseNumber: i + 1,
            type:       tc.isSample ? 'sample' : 'hidden',
            isAnyOrder: problem?.titleSlug === '3sum' || problem?.titleSlug === 'two-sum'
         }));
      }

      if (!testCases.length) {
        logger.warn(`[ExecutionService] No test cases for submission ${submissionId}`);
      }

      console.log(`[VERIFY-STEP4] Received ${testCases.length} test cases for execution.`);
      if (testCases.length > 0) {
        console.log(`[VERIFY-STEP4] First TC Input: ${String(testCases[0].input).slice(0, 50)} | Expected: ${String(testCases[0].output).slice(0, 50)}`);
      }

      // 2.5 Compute missing expected outputs via reference solution if available
      const refCode = jobData.referenceSolution || problem?.referenceSolution;
      if (refCode && refCode.trim() !== '') {
        const tcsMissingOutput = testCases.filter(tc => !tc.output || tc.output.trim() === '');
        if (tcsMissingOutput.length > 0) {
          logger.info(`[ExecutionService] Computing expected outputs for ${tcsMissingOutput.length} custom cases using reference solution.`);
          try {
            const refDriver = driverFactory.getDriver('cpp'); // Reference solutions are C++
            const refProcessedCode = refDriver ? refDriver.wrap(refCode, problemTitle) : refCode;
            const refExecutor = executorFactory.getExecutor();
            
            // We use executeBatch for computing, passing just the missing cases
            let refResult;
            if (typeof refExecutor.executeBatch === 'function') {
               refResult = await refExecutor.executeBatch(refProcessedCode, 'cpp', tcsMissingOutput, null);
            } else {
               refResult = await refExecutor.execute(refProcessedCode, 'cpp', tcsMissingOutput);
               // Wrap the single result if missing
               if (!refResult.results && tcsMissingOutput.length === 1) {
                  refResult.results = [{
                    caseNumber: tcsMissingOutput[0].caseNumber,
                    statusId: refResult.verdict === 'Accepted' ? 3 : 4,
                    output: refResult.output
                  }];
               }
            }
            
            if (refResult && refResult.results) {
               console.log(`[VERIFY-STEP5] Reference solution returned ${refResult.results.length} results.`);
               refResult.results.forEach(res => {
                  console.log(`[VERIFY-STEP5] Ref case ${res.caseNumber} returned statusId ${res.statusId}, output: '${res.output}'`);
                  if (res.statusId === 3) { // If reference solution succeeded without crashing
                    const originalTc = testCases.find(tc => tc.caseNumber === res.caseNumber);
                    if (originalTc) {
                        originalTc.output = (res.output || '').trim(); // Set as the expected output!
                        console.log(`[VERIFY-STEP5] Assigned expected output to testcase ${originalTc.caseNumber}: ${originalTc.output}`);
                    }
                  } else {
                     console.log(`[VERIFY-STEP5] Ref solution failed. compileErr/stderr:`, refResult.errorMessage);
                  }
               });
            }
          } catch (refErr) {
            logger.warn(`[ExecutionService] Failed to compute expected outputs using reference solution: ${refErr.message}`);
          }
        }
      }

      // Flag "any order" problems to tell executor to do a custom check
      const anyOrderKeywords = ['subset', 'permutation', 'combination'];
      const isAnyOrder = anyOrderKeywords.some(kw => problemTitle.toLowerCase().includes(kw));

      if (isAnyOrder) {
        testCases = testCases.map(tc => {
          tc.isAnyOrder = true;
          return tc;
        });
      }

      // 3. Wrap user code via language driver
      const driver = driverFactory.getDriver(language);
      const processedCode = driver ? driver.wrap(code, problemTitle) : code;

      // 4. Execute — use batch path for multiple TCs, sequential for one
      const executor = executorFactory.getExecutor();
      let executionResult;

      if (typeof executor.executeBatch === 'function') {
        // Progress callback: publish an event so the frontend can show a progress bar
        const onProgress = async (done, total) => {
          await publishSubmissionProgress(submissionId, jobData.userId, done, total).catch(() => {});
        };
        executionResult = await executor.executeBatch(processedCode, language, testCases, onProgress);
      } else {
        executionResult = await executor.execute(processedCode, language, testCases);
        if (!executionResult.results && testCases.length === 1) {
           executionResult.results = [{
              caseNumber: testCases[0].caseNumber,
              statusId: executionResult.verdict === 'Accepted' ? 3 : 4,
              output: executionResult.output
           }];
        }
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
          results:          executionResult.results || [],
          testCases:        testCases, // Save dynamically computed expected outputs
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
        executionResult.results || [],
        !!isSubmit // Uses explicit isSubmit flag from jobData
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
