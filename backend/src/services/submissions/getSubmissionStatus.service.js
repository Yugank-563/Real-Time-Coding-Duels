import { findSubmissionById } from '../../repositories/index.js';

export const getSubmissionStatusService = async (submissionId, userId) => {
  const submission = await findSubmissionById(submissionId);
  if (!submission) {
    { const err = new Error('Submission not found.'); err.status = 404; throw err; }
  }

  // Verify access
  if (submission.userId.toString() !== userId) {
    { const err = new Error('You do not have access to view this submission.'); err.status = 403; throw err; }
  }

  const storedResults = submission.results || [];
  const testCases = submission.testCases || [];
  
  const formattedResults = testCases.map((tc, i) => {
    const r = storedResults[i] || {};
    return {
      caseNumber: tc.caseNumber,
      type:       tc.type,
      input:      tc.input,
      output:     r.output  !== undefined ? r.output  : (submission.output || ''),
      expected:   r.expected !== undefined ? r.expected : (tc.output || ''),
      passed:     r.passed  !== undefined ? r.passed  : (submission.verdict === 'AC'),
      status:     r.status  || submission.verdict,
      time:       r.time    || null,
      memory:     r.memory  || null,
    };
  });

  return {
    submissionId: submission._id,
    verdict: submission.verdict,
    executionTime: submission.executionTime,
    memory: submission.memory,
    testCasesPassed: submission.testCasesPassed,
    totalTestCases: submission.totalTestCases,
    errorMessage: submission.errorMessage,
    results: formattedResults.length > 0 ? formattedResults : storedResults,
    originalCode: submission.code,
  };
};
