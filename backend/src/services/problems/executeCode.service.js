import { createSubmission, findProblemBySlugOrTitle } from '../../repositories/index.js';
import { submissionQueue } from '../../config/queue.js';
import { getTestCases as getB2TestCases, getReferenceSolution } from '../testCaseService.js';

const TC_SUBMIT_COUNT_B2 = parseInt(process.env.TC_SUBMIT_LIMIT, 10) || 100;


const buildRunTestCases = async (problem, customInputs) => {
  const allTCs = problem.testCases || [];

  const testCases = [];

  if (customInputs && customInputs.length > 0) {
    customInputs.forEach((input) => {
      if (input && input.trim()) {
        const userKey = input.replace(/\s+/g, '');
        const matchingTC = allTCs.find(tc =>
          tc.input && tc.input.replace(/\s+/g, '') === userKey
        );

        testCases.push({
          input:      input.trim(),
          output:     matchingTC ? (matchingTC.output || '').trim() : '',
          caseNumber: testCases.length + 1,
          type:       'custom',
        });
      }
    });
  }

  if (testCases.length === 0) {
    const sampleCases = allTCs
      .filter(tc => tc.isSample)
      .map((tc, i) => ({
        input:      tc.input,
        output:     tc.output || '',
        caseNumber: i + 1,
        type:       'sample',
      }));
    testCases.push(...sampleCases);
  }
  return testCases;
};

const buildSubmitTestCases = async (problem) => {
  const storageConfigured =
    problem?.testCaseConfig?.totalCount > 0 &&
    problem?.testCaseConfig?.folderPath;

  if (!storageConfigured) {
    const err = new Error(
      `Problem "${problem?.titleSlug}" has no stored test cases configured. ` +
      `Ensure testCaseConfig.totalCount and testCaseConfig.folderPath are set in MongoDB.`
    );
    err.status = 500;
    throw err;
  }

  const storedCases = await getB2TestCases(problem, TC_SUBMIT_COUNT_B2);
  return storedCases.map((tc) => ({
    input:      tc.input,
    output:     tc.expectedOutput,
    caseNumber: tc.caseNumber,
    type:       'hidden',
  }));
};

export const executeCodeService = async ({ userId, slug, code, language, customInputs, isSubmit }) => {
  const problem = await findProblemBySlugOrTitle(slug);
  if (!problem) {
    const err = new Error('Problem not found'); err.status = 404; throw err;
  }

  let testCases = isSubmit
    ? await buildSubmitTestCases(problem)
    : await buildRunTestCases(problem, customInputs);

  // Dynamic payload limit: Prevent Redis (10MB) & MongoDB (16MB) crashes
  let totalSize = 0;
  const safeTestCases = [];
  for (const tc of testCases) {
    const size = (tc.input?.length || 0) + (tc.output?.length || 0);
    if (totalSize + size > 32000000) break; // Cap at 32MB total payload
    safeTestCases.push(tc);
    totalSize += size;
  }
  testCases = safeTestCases;

  if (!testCases.length) {
    const err = new Error('No test cases available for this problem.'); err.status = 400; throw err;
  }

  // Save a highly truncated version to MongoDB to prevent BSON size limits
  const dbTestCases = testCases.map(tc => ({
    caseNumber: tc.caseNumber,
    type: tc.type,
    input:  String(tc.input).substring(0, 1000) + (String(tc.input).length > 1000 ? '...' : ''),
    output: String(tc.output).substring(0, 1000) + (String(tc.output).length > 1000 ? '...' : ''),
  }));

  // If custom inputs have missing expected outputs, try fetching the reference solution from B2/local
  let referenceSolution = null;
  if (!isSubmit && customInputs && customInputs.length > 0) {
    const missingOutputs = testCases.some(tc => !tc.output || tc.output.trim() === '');
    if (missingOutputs) {
      try {
        referenceSolution = await getReferenceSolution(problem);
      } catch (err) {
        console.warn('[executeCode.service] Failed to fetch reference solution:', err.message);
      }
    }
  }

  const submission = await createSubmission({
    userId,
    problemId:       problem._id,
    isSubmit:        !!isSubmit,
    code,
    language,
    verdict:         'pending',
    totalTestCases:  testCases.length,
    testCases:       dbTestCases,
  });

  await submissionQueue.add('execute', {
    submissionId: submission._id.toString(),
    userId,
    code,
    language,
    problemId:    problem._id.toString(),
    testCases,
    referenceSolution,
    isSubmit: !!isSubmit,
  });

  console.log(`Successfully enqueued code execution ${submission._id} for problem ${problem._id}`);

  return {
    submissionId: submission._id
  };
};
