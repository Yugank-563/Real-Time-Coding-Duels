import { findBattleByIdWithPopulated, findSubmissions } from '../../repositories/index.js';

export const getBattleSummaryService = async (battleId) => {
  const battle = await findBattleByIdWithPopulated(battleId, [
    'problem',
    { path: 'players.user', select: 'name email rank xp level' }
  ]);

  if (!battle) {
    throw new Error('Battle room not found.');
  }

  // Fetch all submissions registered for this battle room
  const submissions = await findSubmissions(
    { battleId },
    'userId code language verdict executionTime memory testCasesPassed totalTestCases',
    { createdAt: -1 }
  );

  return {
    battle,
    submissions
  };
};
