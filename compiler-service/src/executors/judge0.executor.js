import axios from 'axios';
import BaseExecutor from './base.executor.js';
import { judge0Config } from '../config/judge0.config.js';
import { JUDGE0_LANGUAGE_MAP, VERDICTS } from '../config/constants.js';
import { encodeBase64, decodeBase64 } from '../utils/base64.js';
import logger from '../utils/logger.js';

export class Judge0Executor extends BaseExecutor {
  async execute(code, language, testCases) {
    const { apiUrl, apiKey } = judge0Config;
    let passed = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let currentVerdict = VERDICTS.AC;
    let compileError = '';

    logger.info(`Executing C++ code on Judge0 Sandbox...`);

    for (let idx = 0; idx < testCases.length; idx++) {
      const tc = testCases[idx];
      
      try {
        const response = await axios.post(
          `${apiUrl}/submissions?base64_encoded=true&wait=false`,
          {
            source_code: encodeBase64(code),
            language_id: JUDGE0_LANGUAGE_MAP[language] || 54, // C++ default fallback
            stdin: encodeBase64(tc.input),
            expected_output: encodeBase64(tc.output),
            cpu_time_limit: 2,
            memory_limit: 262144, // 256MB
          },
          {
            headers: {
              'X-RapidAPI-Key': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        const { token } = response.data;
        
        // Poll submission status until completed (Adaptive polling: short intervals first for quick evaluations, fallback to 800ms)
        let finished = false;
        let pollAttempts = 0;
        let subDetails = null;

        while (!finished && pollAttempts < 15) {
          const delay = pollAttempts === 0 ? 300 : (pollAttempts === 1 ? 500 : 800);
          await new Promise((r) => setTimeout(r, delay));

          const pollRes = await axios.get(`${apiUrl}/submissions/${token}?base64_encoded=true`, {
            headers: { 'X-RapidAPI-Key': apiKey },
          });
          
          subDetails = pollRes.data;
          const statusId = subDetails.status?.id;

          if (statusId && statusId > 2) { // 1 = In Queue, 2 = Processing, > 2 = Done
            finished = true;
          }
          pollAttempts++;
        }

        if (!subDetails) {
          currentVerdict = VERDICTS.RE;
          break;
        }

        const statusId = subDetails.status?.id;
        totalTime += parseFloat(subDetails.time || '0') * 1000; // to ms
        totalMemory += parseFloat(subDetails.memory || '0');

        // Map status results to enums
        if (statusId === 3) {
          passed++;
        } else {
          if (statusId === 4) {
            currentVerdict = VERDICTS.WA;
          } else if (statusId === 5) {
            currentVerdict = VERDICTS.TLE;
          } else if (statusId === 6) {
            currentVerdict = VERDICTS.CE;
            compileError = decodeBase64(subDetails.compile_output);
          } else {
            currentVerdict = VERDICTS.RE;
          }
          break; // Stop running test cases on first error
        }
      } catch (err) {
        logger.error(`Judge0 Request Error on testcase #${idx + 1}:`, err.message);
        currentVerdict = VERDICTS.RE;
        compileError = err.message;
        break;
      }
    }

    return {
      verdict: currentVerdict,
      executionTime: Math.round(totalTime / testCases.length),
      memory: Math.round(totalMemory / testCases.length),
      testCasesPassed: passed,
      errorMessage: currentVerdict === VERDICTS.CE ? compileError : (currentVerdict === VERDICTS.WA ? `Wrong Answer on testcase #${passed + 1}` : ''),
    };
  }
}

export default Judge0Executor;
