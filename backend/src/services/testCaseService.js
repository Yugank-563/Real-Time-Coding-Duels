// testCaseService.js
// 
// Fetches test cases for a problem from Backblaze B2 (S3-compatible storage).
// Checks Redis cache before any B2 call. Caches results for 6 hours.
// 
// File naming convention in B2 bucket:
//   <folderPath>/inputs/input_001.txt
//   <folderPath>/outputs/output_001.txt
//   ...
//   <folderPath>/inputs/input_100.txt
//   <folderPath>/outputs/output_100.txt
// 
// Rules:
//   - Always cache-first (6 hour TTL)
//   - All B2 fetches in parallel via Promise.all
//   - Retry once on connection failure
//   - Never return partial data
//   - Never exceed problem.testCaseConfig.totalCount
//  

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { b2Client, B2_BUCKET_NAME } from '../config/b2Client.js';
import redis from '../config/redis.js';

// Helpers

// Pads a number to 3 digits, e.g. 1 → "001", 42 → "042", 100 → "100"
//  
function padCaseNumber(n) {
  return String(n).padStart(3, '0');
}

// Converts a ReadableStream (from AWS SDK S3 response body) to a plain string.
//  
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Fetches a single object from B2 and returns its text content.
// @param {string} key - Object key (path in bucket)
// @throws Error with clear message if key not found or connection fails
//  
async function fetchObjectFromB2(key, retrying = false) {
  try {
    const command = new GetObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
    });
    const response = await b2Client.send(command);
    return await streamToString(response.Body);
  } catch (err) {
    const isNotFound =
      err.name === 'NoSuchKey' ||
      err.$metadata?.httpStatusCode === 404 ||
      err.Code === 'NoSuchKey';

    if (isNotFound) {
      throw new Error(`[TestCaseService] B2 object not found: "${key}". Verify it exists in bucket "${B2_BUCKET_NAME}".`);
    }

    // Connection/transient error — retry once after 1 second
    if (!retrying) {
      console.warn(`[TestCaseService] B2 fetch failed for "${key}", retrying in 1s…`, err.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchObjectFromB2(key, true);
    }

    throw new Error(`[TestCaseService] B2 connection failed for "${key}" after retry: ${err.message}`);
  }
}

// Public API & Source Fetchers

async function fetchFromLocal(problem, folderPath, actualCount) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const localBasePath = path.resolve(__dirname, '..', '..', '..', 'tests');
  const keys = [];
  for (let i = 1; i <= actualCount; i++) {
    const padded = padCaseNumber(i);
    const inputKey = path.join(localBasePath, folderPath, 'inputs', `input_${padded}.txt`);
    const outputKey = path.join(localBasePath, folderPath, 'outputs', `output_${padded}.txt`);
    keys.push({ caseNumber: i, inputKey, outputKey });
  }

  console.log(`[TestCaseService] Fetching ${actualCount} test cases from LOCAL DISK (${problem.titleSlug})…`);

  const fetchPromises = keys.flatMap(({ caseNumber, inputKey, outputKey }) => [
    fs.promises.readFile(inputKey, 'utf-8').then((text) => ({ caseNumber, type: 'input', text })).catch(err => {
      throw new Error(`[TestCaseService] Missing local input file: ${inputKey}`);
    }),
    fs.promises.readFile(outputKey, 'utf-8').then((text) => ({ caseNumber, type: 'output', text })).catch(err => {
      throw new Error(`[TestCaseService] Missing local output file: ${outputKey}`);
    }),
  ]);

  const results = await Promise.all(fetchPromises);

  const inputMap = new Map();
  const outputMap = new Map();

  for (const { caseNumber, type, text } of results) {
    if (type === 'input') inputMap.set(caseNumber, text.trim());
    else outputMap.set(caseNumber, text.trim());
  }

  return keys.map(({ caseNumber }) => ({
    caseNumber,
    input: inputMap.get(caseNumber) || '',
    expectedOutput: outputMap.get(caseNumber) || '',
  }));
}

async function fetchFromB2(problem, folderPath, actualCount) {
  const keys = [];
  for (let i = 1; i <= actualCount; i++) {
    const padded = padCaseNumber(i);
    const inputKey = `${folderPath}/inputs/input_${padded}.txt`;
    const outputKey = `${folderPath}/outputs/output_${padded}.txt`;
    keys.push({ caseNumber: i, inputKey, outputKey });
  }

  console.log(`[TestCaseService] Fetching ${actualCount} test cases from B2 (${problem.titleSlug})…`);

  const fetchPromises = keys.flatMap(({ caseNumber, inputKey, outputKey }) => [
    fetchObjectFromB2(inputKey).then((text) => ({ caseNumber, type: 'input', text })),
    fetchObjectFromB2(outputKey).then((text) => ({ caseNumber, type: 'output', text })),
  ]);

  const results = await Promise.all(fetchPromises);

  const inputMap = new Map();
  const outputMap = new Map();

  for (const { caseNumber, type, text } of results) {
    if (type === 'input') inputMap.set(caseNumber, text.trim());
    else outputMap.set(caseNumber, text.trim());
  }

  return keys.map(({ caseNumber }) => ({
    caseNumber,
    input: inputMap.get(caseNumber) || '',
    expectedOutput: outputMap.get(caseNumber) || '',
  }));
}

// Fetches test cases from the active source for a problem, with Redis caching.
// 
// @param {Object} problem   - MongoDB Problem document
// @param {number} limit     - Maximum number of test cases to fetch
// @returns {Array<{ caseNumber, input, expectedOutput }>}
//  
export async function getTestCases(problem, limit) {
  const folderPath = problem?.testCaseConfig?.folderPath;
  const totalCount = problem?.testCaseConfig?.totalCount || 0;

  if (!folderPath || totalCount === 0) {
    throw new Error(
      `[TestCaseService] Problem "${problem?.titleSlug}" has no test case configuration (folderPath or totalCount missing).`
    );
  }

  // Step 1: Check Redis cache
  const actualCount = Math.min(limit, totalCount);
  const cacheKey = `testcases:${problem.titleSlug}:${actualCount}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[TestCaseService] Cache HIT for key "${cacheKey}"`);
      return JSON.parse(cached);
    }
  } catch (cacheErr) {
    console.warn('[TestCaseService] Redis cache read failed, proceeding to fetch:', cacheErr.message);
  }

  // Step 2: Route to correct source
  let source = process.env.TESTCASE_SOURCE;
  if (!source || !['local', 'b2'].includes(source)) {
    console.warn(`[TestCaseService] Invalid or missing TESTCASE_SOURCE ("${source}"), defaulting to "local"`);
    source = 'local';
  }

  let testCases;
  if (source === 'b2') {
    testCases = await fetchFromB2(problem, folderPath, actualCount);
  } else {
    testCases = await fetchFromLocal(problem, folderPath, actualCount);
  }

  // Step 3: Cache in Redis for 6 hours
  try {
    await redis.setEx(cacheKey, 21600, JSON.stringify(testCases));
    console.log(`[TestCaseService] Cached ${actualCount} test cases for "${problem.titleSlug}" (TTL: 6h)`);
  } catch (cacheErr) {
    console.warn('[TestCaseService] Redis cache write failed (non-fatal):', cacheErr.message);
  }

  return testCases;
}

// Fetches the reference solution for a problem from B2 (or local).
// 
// @param {Object} problem - MongoDB Problem document
// @returns {string|null} The reference solution code, or null if not found
//  
export async function getReferenceSolution(problem) {
  const folderPath = problem?.testCaseConfig?.folderPath;
  if (!folderPath) return null;

  let source = process.env.TESTCASE_SOURCE;
  if (!source || !['local', 'b2'].includes(source)) {
    source = 'local';
  }

  const cacheKey = `ref_sol:${problem.titleSlug}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch (e) {}

  try {
    let content = null;
    if (source === 'b2') {
      console.log(`[TestCaseService] Fetching Reference Solution from B2 (${folderPath}/reference_solution.cpp)…`);
      content = await fetchObjectFromB2(`${folderPath}/reference_solution.cpp`);
    } else {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const localBasePath = path.resolve(__dirname, '..', '..', '..', 'tests');
      console.log(`[TestCaseService] Fetching Reference Solution from LOCAL DISK (${folderPath}/reference_solution.cpp)…`);
      content = await fs.promises.readFile(path.join(localBasePath, folderPath, 'reference_solution.cpp'), 'utf-8');
    }

    if (content) {
      try {
        // Cache for 24 hours
        await redis.setEx(cacheKey, 86400, content);
      } catch (e) {}
      return content;
    }
  } catch (err) {
    // If not found, just return null, it's optional
    return null;
  }
  return null;
}
