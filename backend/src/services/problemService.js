import axios from 'axios';
import redis from '../config/redis.js';
import { findProblemsByQuery, findOneAndUpdateProblem } from '../repositories/index.js';
import toLeetCode from '../config/topicMap.js';

const LEETCODE_BASE = process.env.LEETCODE_API_URL || 'https://alfa-leetcode-api.onrender.com';
const TIMEOUT_MS = parseInt(process.env.PROBLEM_FETCH_TIMEOUT, 10) || 5000;

/**
 * Case-insensitive lookup helpers for topic mapping
 */
function getLeetCodeTag(topic) {
  if (!topic) return 'array';
  if (toLeetCode[topic]) return toLeetCode[topic];
  const lowerTopic = topic.toLowerCase();
  const key = Object.keys(toLeetCode).find(k => k.toLowerCase() === lowerTopic);
  return key ? toLeetCode[key] : lowerTopic;
}


/**
 * Parsing helper to build simple sample testcases from LeetCode examples
 */
/**
 * Counts how many input parameters a LeetCode C++ method signature has.
 * Used to correctly group multi-line stdin inputs per testcase.
 */
function countParamsFromBoilerplate(cppCode) {
  if (!cppCode) return 1;
  // Match the method signature inside class Solution
  const match = cppCode.match(/[a-zA-Z_][\w<>\*&\s:,]*\s+[a-zA-Z_]\w*\s*\(([^)]*)\)/);
  if (!match) return 1;
  const paramsStr = match[1].trim();
  if (!paramsStr) return 1;
  // Strip nested template brackets to avoid false comma splits (e.g. map<int,int>)
  let clean = '';
  let depth = 0;
  for (const ch of paramsStr) {
    if (ch === '<') depth++;
    else if (ch === '>') depth--;
    else if (depth === 0) clean += ch;
  }
  const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
  return parts.length || 1;
}

/**
 * Parses the expected output values from the HTML description of a problem.
 * LeetCode always includes "<strong>Output:</strong> <value>" in example blocks.
 */
function parseExpectedOutputs(contentHtml) {
  if (!contentHtml) return [];
  const outputs = [];
  // Primary match: <strong>Output:</strong> value
  const regex = /Output:<\/strong>\s*([^\n<]+)/g;
  let match;
  while ((match = regex.exec(contentHtml)) !== null) {
    outputs.push(match[1].trim());
  }
  // Fallback: plain "Output: value" text
  if (!outputs.length) {
    const plain = /Output:\s*([^\n<]+)/g;
    while ((match = plain.exec(contentHtml)) !== null) {
      outputs.push(match[1].trim());
    }
  }
  return outputs;
}

/**
 * Builds testcases by grouping N consecutive lines per testcase (N = param count).
 * Expected outputs are parsed from the HTML description and assigned 1-to-1 by index.
 */
function buildTestCases(examplesStr, paramCount = 1, expectedOutputs = []) {
  if (!examplesStr) return [];
  const lines = examplesStr.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const testCases = [];
  const step = Math.max(1, paramCount);
  let tcIdx = 0;
  for (let i = 0; i < lines.length; i += step) {
    const chunk = lines.slice(i, i + step);
    if (chunk.length > 0) {
      testCases.push({
        input: chunk.join('\n'),
        output: expectedOutputs[tcIdx] || '',
        isSample: tcIdx < 2
      });
      tcIdx++;
    }
  }
  return testCases;
}



/**
 * LAST RESORT: fetchFromMongoDB
 */
async function fetchFromMongoDB(topic, difficulty) {
  const lcTag = getLeetCodeTag(topic);
  const dbDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

  const problems = await findProblemsByQuery({
    tags: { $regex: lcTag, $options: 'i' },
    difficulty: dbDiff
  }, 50);

  if (!problems.length) return null;

  const picked = problems[Math.floor(Math.random() * problems.length)];
  return picked.toObject();
}

/**
 * EXPORTED ORCHESTRATOR PIPELINE
 */
export async function getRandomProblem(topic, difficulty) {
  const normDifficulty = difficulty?.toLowerCase() || 'medium';
  const cacheKey = `problem:random:${topic}:${normDifficulty}`;

  // Step 0: Prioritize curated pre-seeded problems with perfect expected outputs in MongoDB
  try {
    const localProblem = await fetchFromMongoDB(topic, normDifficulty);
    if (localProblem) {
      const hasOutput = localProblem.testCases && localProblem.testCases.some(t => t.output && t.output.trim() !== '');
      if (hasOutput) {
        console.log(`[problemService] Prioritizing curated database problem: "${localProblem.title}"`);
        return localProblem;
      }
    }
  } catch (err) {
    console.error('[problemService] Local MongoDB prioritization failed:', err.message);
  }

  // Step 1: Check Redis cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const pool = JSON.parse(cached);
      if (pool && pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Redis cache read error:', err.message);
    }
  }

  // Step 2: Try LeetCode API is strictly disabled to prevent automatic additions
  console.log('[problemService] LeetCode auto-fetch is disabled manually per rules. Skipping to MongoDB Fallback');

  // Step 3: Last Resort — MongoDB Cache
  try {
    const problem = await fetchFromMongoDB(topic, normDifficulty);
    if (problem) return problem;
  } catch (err) {
    console.error('[problemService] MongoDB fallback failed:', err.message);
  }

  // Step 5: Relax topic constraint — fetch any problem of the requested difficulty from MongoDB
  try {
    console.log(`[problemService] Relaxing topic constraint. Searching MongoDB for any '${normDifficulty}' problem...`);
    const dbDiff = normDifficulty.charAt(0).toUpperCase() + normDifficulty.slice(1).toLowerCase();
    const problems = await findProblemsByQuery({ difficulty: dbDiff }, 50);
    if (problems.length > 0) {
      const picked = problems[Math.floor(Math.random() * problems.length)];
      console.log(`[problemService] Fallback match succeeded with problem: "${picked.title}"`);
      return picked.toObject();
    }
  } catch (err) {
    console.error('[problemService] MongoDB relaxed topic fallback failed:', err.message);
  }

  // Step 6: Ultimate Fallback — fetch absolutely any problem from MongoDB regardless of topic or difficulty
  try {
    console.log(`[problemService] Ultimate fallback. Searching MongoDB for absolutely any problem...`);
    const problems = await findProblemsByQuery({}, 50);
    if (problems.length > 0) {
      const picked = problems[Math.floor(Math.random() * problems.length)];
      console.log(`[problemService] Ultimate fallback match succeeded with problem: "${picked.title}"`);
      return picked.toObject();
    }
  } catch (err) {
    console.error('[problemService] MongoDB ultimate fallback failed:', err.message);
  }

  { const err = new Error('All problem sources and database fallbacks are empty. Seeding is required.'); err.status = 400; throw err; }
}

export async function fetchAndStoreProblemDetails(titleSlug) {
  console.log(`[problemService] Fetching specific problem details for "${titleSlug}" from LeetCode...`);
  
  const detail = await axios.get(`${LEETCODE_BASE}/select`, {
    params: { titleSlug },
    timeout: TIMEOUT_MS
  });

  const p = detail.data;
  if (!p) {
    { const err = new Error(`Problem not found on LeetCode: ${titleSlug}`); err.status = 404; throw err; }
  }

  let cppBoilerplate = `class Solution {\npublic:\n    // Write your code here\n};`;

  try {
    const gqlRes = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `
          query questionEditorData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              codeSnippets {
                langSlug
                code
              }
            }
          }
        `,
        variables: { titleSlug },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Referer': `https://leetcode.com/problems/${titleSlug}/`,
        },
        timeout: 5000,
      }
    );

    const snippets = gqlRes.data?.data?.question?.codeSnippets || [];
    const cppSnippet = snippets.find(s => s.langSlug === 'cpp');
    if (cppSnippet && cppSnippet.code) {
      cppBoilerplate = cppSnippet.code;
    }
  } catch (gqlErr) {
    console.warn('[problemService] LeetCode GraphQL boilerplate query failed, falling back to default:', gqlErr.message);
  }

  const rawDiff = p.difficulty || 'Medium';
  const dbDiff = rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();

  const mapped = {
    title:       p.questionTitle || p.title || titleSlug,
    titleSlug:   p.titleSlug || titleSlug,
    difficulty:  dbDiff,
    content:     p.question || p.content || '',
    tags:        p.topicTags?.map(t => t.slug) || [],
    testCases:   buildTestCases(
      p.exampleTestcases || '',
      countParamsFromBoilerplate(cppBoilerplate),
      parseExpectedOutputs(p.question || p.content || '')
    ),
    boilerplates: { cpp: cppBoilerplate }
  };

  const updatedProblem = await findOneAndUpdateProblem(
    { titleSlug: mapped.titleSlug },
    { ...mapped, cachedAt: new Date() },
    { upsert: true, new: true }
  );

  return updatedProblem;
}
