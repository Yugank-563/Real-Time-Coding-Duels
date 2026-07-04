import { findProblemsByDifficulty, findAllProblems, createBattle, findOneAndUpdateProblem } from '../../repositories/index.js';
import { getRandomProblem } from '../problemService.js';

export const createPrivateRoomService = async (name, difficulty, timeLimit, userId, originHeader, isCasual = false) => {
  if (!name) {
    { const err = new Error('Room Name is required.'); err.status = 400; throw err; }
  }

  let randomProblem;
  try {
    const problemData = await getRandomProblem('Array', difficulty || 'Medium');
    const dbDiff = (difficulty || 'Medium').charAt(0).toUpperCase() + (difficulty || 'Medium').slice(1).toLowerCase();
    randomProblem = await findOneAndUpdateProblem(
      { titleSlug: problemData.titleSlug },
      { 
        ...problemData,
        description: problemData.content,
        difficulty: dbDiff,
        boilerplates: { cpp: `class Solution {\npublic:\n    // Write your code here\n};` }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[PrivateLobby] Fallback to database repository query:', err.message);
    let problems = await findProblemsByDifficulty(difficulty || 'Medium');
    if (!problems || problems.length === 0) {
      problems = await findAllProblems();
    }
    if (!problems || problems.length === 0) {
      { const err = new Error('Problem service unavailable and no offline fallbacks exist.'); err.status = 400; throw err; }
    }
    randomProblem = problems[Math.floor(Math.random() * problems.length)];
  }

  const dbDiffFallback = (difficulty || 'Medium').charAt(0).toUpperCase() + (difficulty || 'Medium').slice(1).toLowerCase();

  const battle = await createBattle({
    players: [
      { user: userId, status: 'ready' }
    ],
    problem: randomProblem._id,
    battleType: 'custom',
    status: 'waiting',
    roomName: name,
    timeLimit: timeLimit ? parseInt(timeLimit, 10) : 1200,
    difficulty: typeof dbDiff !== 'undefined' ? dbDiff : dbDiffFallback,
    host: userId,
    isCasual: true
  });

  return {
    roomId: battle._id
  };
};
