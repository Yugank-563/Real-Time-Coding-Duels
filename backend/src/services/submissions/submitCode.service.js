import { findProblemById, findBattleById, createSubmission } from '../../repositories/index.js';
import { submissionQueue } from '../../config/queue.js';
import { getTestCases as getB2TestCases } from '../testCaseService.js';

const TC_SUBMIT_B2 = parseInt(process.env.TC_SUBMIT_LIMIT, 10) || 100;

export const submitCodeService = async (battleId, code, language, problemId, userId) => {
  if (!code || !language || !problemId) {
    const err = new Error('Missing required parameter: code, language, or problemId.'); err.status = 400; throw err;
  }

  const problem = await findProblemById(problemId);
  if (!problem) {
    const err = new Error('Target problem not found.'); err.status = 404; throw err;
  }

  // Verify player is part of the battle if battleId is provided
  if (battleId) {
    const battle = await findBattleById(battleId);
    if (!battle) {
      const err = new Error('Battle room not found.'); err.status = 404; throw err;
    }
    const isPlayer = battle.players.some(p => p.user.toString() === userId);
    if (!isPlayer) {
      const err = new Error('You are not a participant in this battle.'); err.status = 403; throw err;
    }
  }

  // ── Fetch test cases ────────────────────────────────────────────────
  const storageConfigured =
    problem?.testCaseConfig?.totalCount > 0 &&
    problem?.testCaseConfig?.folderPath;

  if (!storageConfigured) {
    const err = new Error(
      `Problem "${problem?.titleSlug}" has no stored test cases configured. ` +
      `Ensure testCaseConfig.totalCount and testCaseConfig.folderPath are set.`
    );
    err.status = 500;
    throw err;
  }

  const storedCases = await getB2TestCases(problem, TC_SUBMIT_B2);
  const testCases = storedCases.map((tc) => ({
    input:      tc.input,
    output:     tc.expectedOutput,
    caseNumber: tc.caseNumber,
    type:       'hidden',
  }));

  // Create the Submission document inside MongoDB
  const submission = await createSubmission({
    userId,
    problemId,
    battleId: battleId || null,
    code,
    language,
    verdict: 'pending',
    totalTestCases: testCases.length,
    testCases,
  });

  // Add task to BullMQ Redis Queue
  await submissionQueue.add('execute', {
    submissionId: submission._id.toString(),
    userId,
    code,
    language,
    problemId,
    testCases,
    isSubmit: true,
  });

  console.log(`Successfully enqueued code submission ${submission._id} for problem ${problemId}`);

  return {
    submissionId: submission._id
  };
};
