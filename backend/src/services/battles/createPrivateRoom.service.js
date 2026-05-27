import crypto from 'crypto';
import { findProblemsByDifficulty, findAllProblems, createBattle, findBattleByRoomCode } from '../../repositories/index.js';

export const createPrivateRoomService = async (name, password, difficulty, timeLimit, userId, originHeader) => {
  if (!name) {
    throw new Error('Room Name is required.');
  }

  // Find random problem with the selected difficulty
  let problems = await findProblemsByDifficulty(difficulty || 'Medium');
  if (!problems || problems.length === 0) {
    problems = await findAllProblems();
  }
  if (!problems || problems.length === 0) {
    throw new Error('No coding challenges exist in system.');
  }
  const randomProblem = problems[Math.floor(Math.random() * problems.length)];

  // Generate unique 8-character uppercase roomCode
  let roomCode;
  let isUnique = false;
  while (!isUnique) {
    roomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const existing = await findBattleByRoomCode(roomCode);
    if (!existing) isUnique = true;
  }

  const battle = await createBattle({
    players: [
      { user: userId, status: 'ready' }
    ],
    problem: randomProblem._id,
    battleType: 'custom',
    status: 'waiting',
    roomName: name,
    password: password || '',
    roomCode,
    timeLimit: timeLimit ? parseInt(timeLimit, 10) : 1200,
    difficulty: difficulty || 'Medium',
    host: userId,
  });

  const shareLink = `${originHeader || 'http://localhost:5173'}/battle/private/${battle._id}/lobby`;

  return {
    roomId: battle._id,
    roomCode,
    shareLink
  };
};
