import axios from 'axios';
import BaseExecutor from './base.executor.js';
import { judge0Config } from '../config/judge0.config.js';
import { JUDGE0_LANGUAGE_MAP, VERDICTS } from '../config/constants.js';
import { encodeBase64, decodeBase64 } from '../utils/base64.js';
import logger from '../utils/logger.js';

const axiosWithRetry = async (url, payload, config, isGet = false, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (isGet) return await axios.get(url, config);
      return await axios.post(url, payload, config);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        if (i === maxRetries - 1) throw error;
        const delay = 1500 * Math.pow(2, i);
        logger.warn(`Rate limited (429) from Judge0. Retrying in ${delay}ms... (Attempt ${i + 1})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
};

// Batch size must not exceed Judge0's API limit (20 per request on RapidAPI)
const BATCH_SIZE = parseInt(process.env.JUDGE0_BATCH_SIZE, 10) || 20;

const decodeHTMLEntities = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const cleanInputBlock = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .split('\n')
    .map(line => {
      let l = line.trim();
      l = decodeHTMLEntities(l);
      if (l.length >= 2 && l.startsWith('"') && l.endsWith('"')) {
        l = l.substring(1, l.length - 1);
      }
      return l;
    })
    .join('\n');
};

const checkAnyOrderMatch = (stdout, expected) => {
  try {
    const outArr = JSON.parse(stdout);
    const expArr = JSON.parse(expected);
    if (!Array.isArray(outArr) || !Array.isArray(expArr)) return stdout.replace(/\s/g, '') === expected.replace(/\s/g, '');
    if (outArr.length !== expArr.length) return false;

    const sortFn = (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return a.length - b.length;
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return a[i] - b[i];
        }
        return 0;
      }
      return a - b;
    };

    // We do NOT sort inner arrays. We just sort the outer array so that the set of permutations/subsets matches.
    // (Note: For subsets, LeetCode treats [1,2] and [2,1] as the same, but the user's DFS usually emits them sorted if the input is sorted.
    // If strict subset inner-sorting is required, we'd need a separate flag. For now, outer sort is safe for both if they emit same elements).
    outArr.sort(sortFn);
    expArr.sort(sortFn);

    return JSON.stringify(outArr) === JSON.stringify(expArr);
  } catch (e) {
    return stdout.replace(/\s/g, '') === expected.replace(/\s/g, '');
  }
};

const adjustCompileError = (compileOutput, sourceCode) => {
  if (!compileOutput || !sourceCode) return compileOutput;
  const lines = sourceCode.split('\n');
  const markerIndex = lines.findIndex(l => l.includes('// %%USER_CODE_START%%'));
  if (markerIndex === -1) return compileOutput;
  
  const offset = markerIndex + 1;
  let adjusted = compileOutput.replace(/main\.cpp:(\d+):(\d+):/g, (match, p1, p2) => {
    const adjustedLine = Math.max(1, parseInt(p1) - offset);
    return `main.cpp:${adjustedLine}:${p2}:`;
  });
  
  adjusted = adjusted.replace(/(^\s*)(\d+)(\s*\|)/gm, (match, p1, p2, p3) => {
    const adjustedLine = Math.max(1, parseInt(p2) - offset);
    return `${p1}${adjustedLine}${p3}`;
  });
  
  return adjusted;
};

export class Judge0Executor extends BaseExecutor {

  // ── Sequential single-TC executor (original — kept for backward compat) ────
  async execute(code, language, testCases) {
    const cleanedCases = (testCases || []).map(tc => ({
      ...tc,
      input:  cleanInputBlock(tc.input || ''),
      output: cleanInputBlock(tc.output || ''),
    }));

    const { apiUrl, apiKey } = judge0Config;
    let passed = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let currentVerdict = VERDICTS.AC;
    let compileError = '';

    logger.info(`Executing C++ code on Judge0 Sandbox...`);
    let lastStdout = '';

    for (let idx = 0; idx < cleanedCases.length; idx++) {
      const tc = cleanedCases[idx];

      try {
        // Only send expected_output when we have one — empty string causes
        // Judge0 to mark any non-empty output as WA.
        const submissionPayload = {
          source_code: encodeBase64(code),
          language_id: JUDGE0_LANGUAGE_MAP[language] || 54,
          stdin: encodeBase64(tc.input),
          cpu_time_limit: 2,
          memory_limit: 262144, // 256MB
        };
        const hasMultipleOutputs = tc.output && tc.output.includes('|||OR|||');
        if (tc.output && tc.output.trim() && !tc.isAnyOrder && !hasMultipleOutputs) {
          submissionPayload.expected_output = encodeBase64(tc.output.trim());
        }

        const response = await axiosWithRetry(
          `${apiUrl}/submissions?base64_encoded=true&wait=false`,
          submissionPayload,
          { headers: { 'X-RapidAPI-Key': apiKey, 'Content-Type': 'application/json' } }
        );

        const { token } = response.data;

        // Adaptive polling: fast first, slow thereafter
        let finished = false;
        let pollAttempts = 0;
        let subDetails = null;

        while (!finished && pollAttempts < 15) {
          const delay = pollAttempts === 0 ? 300 : (pollAttempts === 1 ? 500 : 800);
          await new Promise((r) => setTimeout(r, delay));

          const pollRes = await axiosWithRetry(`${apiUrl}/submissions/${token}?base64_encoded=true`, null, {
            headers: { 'X-RapidAPI-Key': apiKey },
          }, true);

          subDetails = pollRes.data;
          if (subDetails.status?.id && subDetails.status.id > 2) finished = true;
          pollAttempts++;
        }

        if (!subDetails) { currentVerdict = VERDICTS.RE; break; }

        const statusId = subDetails.status?.id;
        totalTime   += parseFloat(subDetails.time   || '0') * 1000;
        totalMemory += parseFloat(subDetails.memory || '0');
        lastStdout   = decodeBase64(subDetails.stdout || '').trim();

        if (statusId === 3) {
          if (tc.isAnyOrder) {
            const isMatch = checkAnyOrderMatch(lastStdout, tc.output || '');
            if (!isMatch) {
              currentVerdict = VERDICTS.WA;
              break;
            } else {
              passed++;
            }
          } else if (tc.output && tc.output.includes('|||OR|||')) {
            const possibleOutputs = tc.output.split('|||OR|||').map(s => s.trim().replace(/\s/g, ''));
            const isMatch = possibleOutputs.includes(lastStdout.replace(/\s/g, ''));
            if (!isMatch) {
              currentVerdict = VERDICTS.WA;
              break;
            } else {
              passed++;
            }
          } else {
            passed++; // AC — trust Judge0's comparison
          }
        } else if (statusId === 4) {
          currentVerdict = VERDICTS.WA;
        } else if (statusId === 5) {
          currentVerdict = VERDICTS.TLE;
        } else if (statusId === 6) {
          currentVerdict = VERDICTS.CE;
          compileError = adjustCompileError(decodeBase64(subDetails.compile_output || ''), code);
        } else {
          currentVerdict = VERDICTS.RE;
        }
        if (statusId !== 3) break;
      } catch (err) {
        logger.error(`Judge0 Request Error on testcase #${idx + 1}:`, err.message);
        currentVerdict = VERDICTS.RE;
        compileError = err.message;
        break;
      }
    }

    return {
      verdict: currentVerdict,
      executionTime: Math.round(totalTime / Math.max(1, testCases.length)),
      memory: Math.round(totalMemory / Math.max(1, testCases.length)),
      testCasesPassed: passed,
      output: lastStdout,
      errorMessage:
        currentVerdict === VERDICTS.CE ? compileError
        : currentVerdict === VERDICTS.WA ? `Wrong Answer on testcase #${passed + 1}`
        : '',
    };
  }

  // ── Batch executor — POST all TCs in chunks, collect all tokens, poll once ─
  /**
   * @param {string}   code         — fully wrapped C++ source code
   * @param {string}   language     — 'cpp' etc.
   * @param {Array}    testCases    — [{ input, output, caseNumber, type }]
   * @param {Function} [onProgress] — callback(done, total) after each poll round
   * @returns {{ verdict, testCasesPassed, totalTestCases, results[], executionTime, memory, output, errorMessage }}
   */
  async executeBatch(code, language, testCases, onProgress) {
    const cleanedCases = (testCases || []).map(tc => ({
      ...tc,
      input:  cleanInputBlock(tc.input || ''),
      output: cleanInputBlock(tc.output || ''),
    }));

    const { apiUrl, apiKey } = judge0Config;
    const langId = JUDGE0_LANGUAGE_MAP[language] || 54;
    const total  = cleanedCases.length;
    let doneSoFar = 0;

    logger.info(`[Batch] Submitting ${total} TCs with Fast-Fail Early Stopping`);

    const results = [];
    let overallVerdict = VERDICTS.AC;
    let totalTime = 0;
    let totalMem = 0;
    let passed = 0;
    let firstFailOut = '';
    let compileErr = '';
    const PRIO = { CE: 5, RE: 4, TLE: 3, MLE: 2, WA: 1, AC: 0 };
    
    // Fast-fail execution loop
    for (let start = 0; start < total; start += BATCH_SIZE) {
      if (overallVerdict !== VERDICTS.AC) {
        // Fast-fail: skip remaining
        const skipped = cleanedCases.slice(start).map(tc => ({
          caseNumber: tc.caseNumber, type: tc.type || 'random',
          input: tc.input, output: 'Skipped (Fast-Fail)', expected: tc.output || '',
          passed: false, statusId: 0, status: 'Skipped',
          time: 0, memory: 0,
        }));
        results.push(...skipped);
        doneSoFar += skipped.length;
        if (onProgress) onProgress(doneSoFar, total);
        break; // skip the rest of the chunks entirely
      }

      const chunk = cleanedCases.slice(start, start + BATCH_SIZE);
      const submissions = chunk.map(tc => {
        const sub = {
          source_code:    encodeBase64(code),
          language_id:    langId,
          stdin:          encodeBase64(tc.input || ''),
          cpu_time_limit: 1.0, // Strict C++ timeout
          memory_limit:   262144,
        };
        const hasMultipleOutputs = tc.output && tc.output.includes('|||OR|||');
        if (tc.output && tc.output.trim() && !tc.isAnyOrder && !hasMultipleOutputs) {
          sub.expected_output = encodeBase64(tc.output.trim());
        }
        return sub;
      });

      // Submit chunk
      const tokenMap = [];
      try {
        const batchRes = await axiosWithRetry(
          `${apiUrl}/submissions/batch?base64_encoded=true`,
          { submissions },
          { headers: { 'X-RapidAPI-Key': apiKey, 'Content-Type': 'application/json' } }
        );
        const tokens = Array.isArray(batchRes.data) ? batchRes.data : [];
        tokens.forEach((t, i) => {
          if (t?.token) tokenMap.push({ token: t.token, tc: chunk[i] });
          else          tokenMap.push({ token: null, tc: chunk[i], error: 'No token returned' });
        });
        while (tokenMap.length < chunk.length) {
          tokenMap.push({ token: null, tc: chunk[tokenMap.length], error: 'Missing token' });
        }
      } catch (err) {
        logger.error(`[Batch] Chunk submit failed at idx ${start}:`, err.message);
        chunk.forEach(tc => tokenMap.push({ token: null, tc, error: err.message }));
      }

      // Poll chunk
      let pendingTokens = tokenMap.filter(e => e.token);
      const resultMap = new Map();
      let pollCount = 0;

      while (pendingTokens.length > 0 && pollCount < 15) {
        await new Promise(r => setTimeout(r, 1000));
        pollCount++;

        const tokStr = pendingTokens.map(e => e.token).join(',');
        try {
          const pollRes = await axiosWithRetry(
            `${apiUrl}/submissions/batch?tokens=${tokStr}&base64_encoded=true`,
            null,
            { headers: { 'X-RapidAPI-Key': apiKey } },
            true
          );
          const subs = pollRes.data?.submissions || [];
          subs.forEach((sub, j) => {
            if (sub?.status?.id > 2) resultMap.set(pendingTokens[j].token, sub);
          });
        } catch (err) {
          logger.warn(`[Batch] Poll ${pollCount} failed:`, err.message);
        }

        pendingTokens = pendingTokens.filter(e => !resultMap.has(e.token));
      }

      // Evaluate chunk results
      for (const { token, tc, error } of tokenMap) {
        const sub = token ? resultMap.get(token) : null;
        let tcPassed = false;
        let tcVerdict = VERDICTS.RE;

        let statusId, stdout, stderr, cOut, time_ms, mem_kb, statusDesc;

        if (!sub && !error) {
          tcVerdict = VERDICTS.TLE;
          statusId = 5; statusDesc = 'Time Limit Exceeded';
          stdout = ''; stderr = ''; cOut = ''; time_ms = 0; mem_kb = 0;
        } else if (error && !sub) {
          tcVerdict = VERDICTS.RE;
          statusId = 13; statusDesc = 'Internal Error';
          stdout = error; stderr = ''; cOut = ''; time_ms = 0; mem_kb = 0;
        } else {
          statusId = sub.status?.id;
          statusDesc = sub.status?.description || 'Unknown';
          stdout = decodeBase64(sub.stdout || '').trim();
          stderr = decodeBase64(sub.stderr || '').trim();
          cOut = decodeBase64(sub.compile_output || '').trim();
          time_ms = Math.round(parseFloat(sub.time || '0') * 1000);
          mem_kb = Math.round(parseFloat(sub.memory || '0'));

          if (statusId === 3) {
            if (tc.isAnyOrder) {
              const isMatch = checkAnyOrderMatch(stdout, tc.output || '');
              if (!isMatch) {
                tcPassed = false;
                tcVerdict = VERDICTS.WA;
                statusId = 4;
                statusDesc = 'Wrong Answer';
                if (!firstFailOut) firstFailOut = stdout;
              } else {
                tcPassed = true; tcVerdict = VERDICTS.AC; passed++;
              }
            } else if (tc.output && tc.output.includes('|||OR|||')) {
              const possibleOutputs = tc.output.split('|||OR|||').map(s => s.trim().replace(/\s/g, ''));
              const isMatch = possibleOutputs.includes(stdout.trim().replace(/\s/g, ''));
              if (!isMatch) {
                tcPassed = false;
                tcVerdict = VERDICTS.WA;
                statusId = 4;
                statusDesc = 'Wrong Answer';
                if (!firstFailOut) firstFailOut = stdout;
              } else {
                tcPassed = true; tcVerdict = VERDICTS.AC; passed++;
              }
            } else {
              tcPassed = true; tcVerdict = VERDICTS.AC; passed++;
            }
          }
          else if (statusId === 4) { tcVerdict = VERDICTS.WA; if (!firstFailOut) firstFailOut = stdout; }
          else if (statusId === 5) { tcVerdict = VERDICTS.TLE; }
          else if (statusId === 6) { tcVerdict = VERDICTS.CE; compileErr = adjustCompileError(cOut, code); }
          else if (statusId >= 7 && statusId <= 12) { 
            tcVerdict = VERDICTS.RE; 
            // Judge0 automatically provides accurate descriptions like 'Runtime Error (SIGFPE)'
            statusDesc = sub.status?.description || 'Runtime Error'; 
          }
          else { tcVerdict = VERDICTS.RE; }
        }

        totalTime += time_ms;
        totalMem += mem_kb;

        if ((PRIO[tcVerdict] || 0) > (PRIO[overallVerdict] || 0)) {
          overallVerdict = tcVerdict;
        }

        results.push({
          caseNumber: tc.caseNumber,
          type: tc.type || 'random',
          input: tc.input,
          output: stdout || stderr,
          expected: tc.output || '',
          passed: tcPassed,
          statusId,
          status: statusDesc,
          time: time_ms,
          memory: mem_kb,
        });
      }

      doneSoFar += chunk.length;
      if (onProgress) onProgress(doneSoFar, total);
    }

    const avgTime = passed > 0 ? Math.round(totalTime / passed) : 0;
    const avgMem = passed > 0 ? Math.round(totalMem / passed) : 0;

    return {
      verdict: overallVerdict,
      testCasesPassed: passed,
      totalTestCases: total,
      results,
      executionTime: avgTime,
      memory: avgMem,
      output: firstFailOut,
      errorMessage:
        overallVerdict === VERDICTS.CE ? compileErr
        : overallVerdict === VERDICTS.WA ? `Wrong Answer — ${passed}/${total} passed`
        : overallVerdict !== VERDICTS.AC ? `${overallVerdict} on a test case`
        : '',
    };
  }
}

export default Judge0Executor;
