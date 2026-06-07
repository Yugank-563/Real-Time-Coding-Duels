import { findProblemById, findBattleById, createSubmission } from '../../repositories/index.js';
import { submissionQueue } from '../../config/queue.js';
import { generateTestCases } from '../testCaseGeneratorService.js';

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

  // ── Auto-generate test cases ───────────────────────────────────────────
  const TC_SUBMIT_COUNT = parseInt(process.env.TC_SUBMIT_COUNT, 10) || 50;
  let testCases;
  try {
    testCases = await generateTestCases(problem, TC_SUBMIT_COUNT);
  } catch (genErr) {
    console.warn('[Submit] TC generation failed, falling back to sample TCs:', genErr.message);
    testCases = (problem.testCases || []).map((tc, i) => ({
      input:      tc.input,
      output:     tc.output || '',
      caseNumber: i + 1,
      type:       'sample',
    }));
  }

  // Create the Submission document inside MongoDB
  const submission = await createSubmission({
    userId,
    problemId,
    battleId: battleId || null,
    code,
    language,
    verdict: 'pending',
    totalTestCases: testCases.length,
  });

  // Add task to BullMQ Redis Queue
  await submissionQueue.add('execute', {
    submissionId: submission._id.toString(),
    userId,       // Required for progress/socket routing in compiler-service
    code,
    language,
    problemId,
    testCases,
  });

  console.log(`Successfully enqueued code submission ${submission._id} for problem ${problemId}`);

  return {
    submissionId: submission._id
  };
};
