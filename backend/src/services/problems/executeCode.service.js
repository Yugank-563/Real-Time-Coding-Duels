import { createSubmission, findSubmissionById } from '../../repositories/index.js';
import { findProblemBySlugOrTitle } from '../../repositories/index.js';
import { submissionQueue } from '../../config/queue.js';
import { generateTestCases } from '../testCaseGeneratorService.js';

const normalizeInput = (str) => {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).filter(Boolean).join('\n');
};

const buildRunTestCases = (problem, customInputs) => {
  const testCases = [];
  if (customInputs && customInputs.length > 0) {
    customInputs.forEach((input, i) => {
      if (input && input.trim()) {
        const normalizedUserVal = normalizeInput(input);
        const matchingTC = (problem.testCases || []).find(tc => 
          normalizeInput(tc.input) === normalizedUserVal
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
    const sampleCases = (problem.testCases || [])
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
  const TC_SUBMIT_COUNT = parseInt(process.env.TC_SUBMIT_COUNT, 10) || 50;
  let testCases;
  try {
    testCases = await generateTestCases(problem, TC_SUBMIT_COUNT);
  } catch (genErr) {
    console.warn('[executeCode.service] TC generation failed, falling back to sample TCs:', genErr.message);
    testCases = (problem.testCases || []).map((tc, i) => ({
      input:      tc.input,
      output:     tc.output || '',
      caseNumber: i + 1,
      type:       'sample',
    }));
  }
  return testCases;
};

export const executeCodeService = async ({ userId, slug, code, language, customInputs, isSubmit }) => {
  const problem = await findProblemBySlugOrTitle(slug);
  if (!problem) {
    throw new Error('Problem not found');
  }

  const testCases = isSubmit 
    ? await buildSubmitTestCases(problem)
    : buildRunTestCases(problem, customInputs);

  if (!testCases.length) {
    throw new Error('No test cases available for this problem.');
  }

  const submission = await createSubmission({
    userId,
    problemId:       problem._id,
    code,
    language,
    verdict:         'pending',
    totalTestCases:  testCases.length,
  });

  await submissionQueue.add('execute', {
    submissionId: submission._id.toString(),
    userId,
    code,
    language,
    problemId:    problem._id.toString(),
    testCases,
  });

  let updatedSub = null;
  let verdict    = 'pending';
  let attempts   = 0;
  const maxAttempts = isSubmit ? 40 : 30;

  while (verdict === 'pending' && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 500));
    updatedSub = await findSubmissionById(submission._id);
    if (updatedSub) verdict = updatedSub.verdict;
    attempts++;
  }

  if (!updatedSub || verdict === 'pending') {
    throw new Error('Execution timed out — please try again.');
  }

  const storedResults = updatedSub.results || [];
  const results = testCases.map((tc, i) => {
    const r = storedResults[i] || {};
    return {
      caseNumber: tc.caseNumber,
      type:       tc.type,
      input:      tc.input,
      output:     r.output  !== undefined ? r.output  : (updatedSub.output || ''),
      expected:   r.expected !== undefined ? r.expected : (tc.output || ''),
      passed:     r.passed  !== undefined ? r.passed  : (updatedSub.verdict === 'AC'),
      status:     r.status  || updatedSub.verdict,
      time:       r.time    || null,
      memory:     r.memory  || null,
    };
  });

  const passedCount = results.filter(r => r.passed).length;

  return {
    state:           verdict === 'CE' || verdict === 'RE' ? 'error' : 'success',
    verdict,
    executionTime:   updatedSub.executionTime || 0,
    memory:          updatedSub.memory        || 0,
    errorMessage:    updatedSub.errorMessage  || '',
    testCasesPassed: passedCount,
    totalTestCases:  testCases.length,
    results,
  };
};
