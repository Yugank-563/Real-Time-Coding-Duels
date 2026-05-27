import { findSubmissionById } from '../../repositories/index.js';

export const getSubmissionStatusService = async (submissionId, userId) => {
  const submission = await findSubmissionById(submissionId);
  if (!submission) {
    throw new Error('Submission not found.');
  }

  // Verify access
  if (submission.userId.toString() !== userId) {
    throw new Error('You do not have access to view this submission.');
  }

  return {
    submissionId: submission._id,
    verdict: submission.verdict,
    executionTime: submission.executionTime,
    memory: submission.memory,
    testCasesPassed: submission.testCasesPassed,
    totalTestCases: submission.totalTestCases,
    errorMessage: submission.errorMessage,
  };
};
