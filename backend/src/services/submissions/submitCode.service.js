import { findProblemById, findBattleById, createSubmission } from '../../repositories/index.js';
import { submissionQueue } from '../../config/queue.js';

export const submitCodeService = async (battleId, code, language, problemId, userId) => {
  if (!code || !language || !problemId) {
    throw new Error('Missing required parameter: code, language, or problemId.');
  }

  const problem = await findProblemById(problemId);
  if (!problem) {
    throw new Error('Target problem not found.');
  }

  // Verify player is part of the battle if battleId is provided
  if (battleId) {
    const battle = await findBattleById(battleId);
    if (!battle) {
      throw new Error('Battle room not found.');
    }
    const isPlayer = battle.players.some(p => p.user.toString() === userId);
    if (!isPlayer) {
      throw new Error('You are not a participant in this battle.');
    }
  }

  // Create the Submission document inside MongoDB
  const submission = await createSubmission({
    userId,
    problemId,
    battleId: battleId || null,
    code,
    language,
    verdict: 'pending',
    totalTestCases: problem.testCases.length,
  });

  // Add task to BullMQ Redis Queue
  await submissionQueue.add('execute', {
    submissionId: submission._id.toString(),
    code,
    language,
    problemId,
    testCases: problem.testCases,
  });

  console.log(`Successfully enqueued code submission ${submission._id} for problem ${problemId}`);

  return {
    submissionId: submission._id
  };
};
