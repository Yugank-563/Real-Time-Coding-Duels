import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import BaseExecutor from './base.executor.js';
import { VERDICTS } from '../config/constants.js';
import logger from '../utils/logger.js';

const execAsync = promisify(exec);

const adjustCompileError = (compileOutput, sourceCode) => {
  if (!compileOutput || !sourceCode) return compileOutput;
  let adjusted = compileOutput.replace(/cc1plus: some warnings being treated as errors\n?/g, '');
  const lines = sourceCode.split('\n');
  const markerIndex = lines.findIndex(l => l.includes('// %%USER_CODE_START%%'));
  if (markerIndex !== -1) {
    const offset = markerIndex + 1;
    adjusted = adjusted.replace(/(?:\/[^\s]*\/)?main\.cpp:(\d+):(?:\d+:)?/g, (match, p1) => {
      const adjustedLine = Math.max(1, parseInt(p1) - offset);
      return `Line ${adjustedLine}:`;
    });
    adjusted = adjusted.replace(/(?:\/[^\s]*\/)?main\.cpp:/g, 'Error: ');
    adjusted = adjusted.replace(/(^\s*)(\d+)(\s*\|)/gm, (match, p1, p2, p3) => {
      const adjustedLine = Math.max(1, parseInt(p2) - offset);
      return `${p1}${adjustedLine}${p3}`;
    });
  } else {
    adjusted = adjusted.replace(/(?:\/[^\s]*\/)?(?:main\.[a-z]+|Solution\.[a-z]+|solution\.[a-z]+):(\d+):(?:\d+:)?/g, 'Line $1:');
    adjusted = adjusted.replace(/(?:\/[^\s]*\/)?(?:main\.[a-z]+|Solution\.[a-z]+|solution\.[a-z]+):/g, 'Error: ');
  }
  return adjusted.trim();
};

export default class LocalExecutor extends BaseExecutor {
  // Executes all testcases sequentially using local file streams
  async executeBatch(code, language, testCases, onProgress) {
    if (language !== 'cpp') {
      throw new Error('LocalExecutor currently only supports C++');
    }

    const runId = crypto.randomUUID();
    const tempDir = path.join('/tmp', `coduelo-${runId}`);
    
    let results = [];
    let testCasesPassed = 0;
    const totalTestCases = testCases.length;

    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      const sourceFile = path.join(tempDir, 'main.cpp');
      const binaryFile = path.join(tempDir, 'main.out');
      
      // 1. Write the source code
      await fs.writeFile(sourceFile, code, 'utf-8');

      // 2. Compile the C++ code
      try {
        await execAsync(`g++ -O2 -std=c++17 ${sourceFile} -o ${binaryFile}`);
      } catch (compileErr) {
        return {
          verdict: VERDICTS.CE,
          testCasesPassed: 0,
          totalTestCases,
          executionTime: 0,
          memory: 0,
          results: [],
          errorMessage: adjustCompileError(compileErr.stderr || compileErr.message, code),
          output: ''
        };
      }

      // 3. Execute Test Cases
      for (let i = 0; i < totalTestCases; i++) {
        const tc = testCases[i];
        
        // Write massive input to a temp file, rather than loading it into RAM
        const inputFile = path.join(tempDir, `tc_${i}.in`);
        await fs.writeFile(inputFile, tc.input || '', 'utf-8');

        try {
          const { stdout, stderr, time, memory } = await this._runBinary(binaryFile, inputFile);
          
          let statusId = 4; // WA
          let expectedOutput = String(tc.output ?? '').trim();
          let actualOutput = String(stdout ?? '').trim();

          // Custom check for "any order" problems (like 3Sum)
          if (tc.isAnyOrder) {
             actualOutput = this._sortAnyOrder(actualOutput);
             expectedOutput = this._sortAnyOrder(expectedOutput);
          }

          // Robust comparison: decode HTML entities, ignore all whitespaces, normalize quotes
          const decodeHTMLEntities = (str) => typeof str === 'string' ? str.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : str;
          const normalize = (str) => decodeHTMLEntities(str).replace(/\s/g, '').replace(/'/g, '"');
          const normActual = normalize(actualOutput);
          const normExpected = normalize(expectedOutput);

          if (!expectedOutput && tc.type === 'custom') {
            // For custom test cases without a reference solution to generate the expected output,
            // we accept the user's output since we cannot verify it.
            statusId = 3;
            testCasesPassed++;
          } else if (normActual === normExpected) {
            statusId = 3; // AC (Direct Match)
            testCasesPassed++;
          } else if (tc.isAnyOrder || this._sortAnyOrder(actualOutput) === this._sortAnyOrder(expectedOutput)) {
            statusId = 3; // AC (Any Order Permutation Match)
            testCasesPassed++;
          } else {
            console.log(`[DEBUG-MISMATCH] Case: ${tc.caseNumber}`);
            console.log(`[DEBUG-MISMATCH] Actual(norm):   ${normActual}`);
            console.log(`[DEBUG-MISMATCH] Expected(norm): ${normExpected}`);
          }

          results.push({
            caseNumber: tc.caseNumber,
            statusId,
            time,
            memory,
            // Truncate output strictly so massive 16MB outputs don't crash MongoDB
            output: actualOutput.substring(0, 1000) 
          });

          if (statusId !== 3) {
            // Stop at first failure
            break;
          }
        } catch (execErr) {
          let statusId = execErr.isTLE ? 5 : 6; // 5: TLE, 6: RE
          results.push({
            caseNumber: tc.caseNumber,
            statusId,
            time: execErr.isTLE ? 2.0 : 0,
            memory: 0,
            output: execErr.message
          });
          break; // Stop at first failure
        }
        
        if (onProgress) {
            await onProgress(i + 1, totalTestCases).catch(() => {});
        }
      }

      // 4. Calculate final verdict
      const firstFailure = results.find(r => r.statusId !== 3);
      const verdict = firstFailure 
        ? (firstFailure.statusId === 4 ? VERDICTS.WA : firstFailure.statusId === 5 ? VERDICTS.TLE : VERDICTS.RE)
        : (results.length === 0 ? VERDICTS.RE : VERDICTS.AC);

      return {
        verdict,
        testCasesPassed,
        totalTestCases,
        executionTime: Math.max(...results.map(r => r.time || 0), 0),
        memory: Math.max(...results.map(r => r.memory || 0), 0),
        results,
        errorMessage: firstFailure ? `Failed on testcase #${firstFailure.caseNumber}` : '',
        output: results.length > 0 ? results[results.length - 1].output : ''
      };

    } catch (err) {
       logger.error(`[LocalExecutor] Fatal Error: ${err.message}`);
       throw err;
    } finally {
      // 5. Cleanup temp directory to prevent disk space leaks
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        logger.error(`LocalExecutor failed to cleanup ${tempDir}:`, err.message);
      }
    }
  }

  async _runBinary(binaryPath, inputPath) {
    return new Promise((resolve, reject) => {
      const startTime = process.hrtime();
      
      const child = spawn(binaryPath, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Collect data, but apply a safety cap to avoid out-of-memory on massive outputs
      child.stdout.on('data', (data) => { 
          if (stdout.length < 50 * 1024 * 1024) { // 50MB max RAM footprint
              stdout += data; 
          }
      });
      child.stderr.on('data', (data) => { stderr += data; });

      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        const err = new Error('Time Limit Exceeded');
        err.isTLE = true;
        reject(err);
      }, 2000); // 2 second time limit (Standard competitive programming TLE)

      // Stream the massive input file directly into the binary's standard input
      const readStream = createReadStream(inputPath);
      readStream.pipe(child.stdin);

      child.on('close', (code) => {
        clearTimeout(timeout);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const timeInSeconds = Number((seconds + nanoseconds / 1e9).toFixed(3));
        
        if (code !== 0 && !child.killed) {
            reject(new Error(stderr || `Process exited with code ${code} (Runtime Error)`));
        } else {
            resolve({
                stdout,
                stderr,
                time: timeInSeconds,
                memory: 1024 // Hardcoded memory footprint for now
            });
        }
      });
    });
  }

  // Helper function to handle AnyOrder problems (like 3Sum, N-Queens, Subsets)
  _sortAnyOrder(outputStr) {
    if (!outputStr) return '';
    const decodeHTMLEntities = (str) => typeof str === 'string'
      ? str.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      : str;
    const cleanStr = decodeHTMLEntities(String(outputStr)).replace(/\s/g, '');

    try {
      const json = JSON.parse(cleanStr);
      if (Array.isArray(json)) {
        const sorted = json.map(item => {
          if (Array.isArray(item)) {
            return [...item].sort((a, b) => String(a).localeCompare(String(b)));
          }
          return item;
        }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
        return JSON.stringify(sorted);
      }
    } catch (e) {}

    try {
      const lines = cleanStr.trim().split('\n');
      return lines
        .map(line => line.trim().split(/[, ]+/).sort((a, b) => String(a).localeCompare(String(b))).join(','))
        .sort()
        .join('\n');
    } catch (e) {
      return cleanStr;
    }
  }

  async execute(code, language, testCases) {
     return this.executeBatch(code, language, testCases);
  }
}
