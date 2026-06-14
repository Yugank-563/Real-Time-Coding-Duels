import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { findProblemsByDifficulty, findAllProblems, createBattle, findBattleByRoomCode } from '../../repositories/index.js';
import { Problem } from '../../models/index.js';
import { getRandomProblem } from '../problemService.js';

export const createPrivateRoomService = async (name, password, difficulty, timeLimit, userId, originHeader) => {
  if (!name) {
    { const err = new Error('Room Name is required.'); err.status = 400; throw err; }
  }

  let randomProblem;
  try {
    const problemData = await getRandomProblem('Array', difficulty || 'Medium');
    const dbDiff = (difficulty || 'Medium').charAt(0).toUpperCase() + (difficulty || 'Medium').slice(1).toLowerCase();
    randomProblem = await Problem.findOneAndUpdate(
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

  // Generate unique 8-character uppercase roomCode (max 10 attempts)
  let roomCode;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    roomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const existing = await findBattleByRoomCode(roomCode);
    if (!existing) isUnique = true;
    attempts++;
  }
  if (!isUnique) {
    const err = new Error('Failed to generate a unique room code. Please try again.');
    err.status = 500;
    throw err;
  }

  let hashedPassword = '';
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const battle = await createBattle({
    players: [
      { user: userId, status: 'ready' }
    ],
    problem: randomProblem._id,
    battleType: 'custom',
    status: 'waiting',
    roomName: name,
    password: hashedPassword,
    roomCode,
    timeLimit: timeLimit ? parseInt(timeLimit, 10) : 1200,
    difficulty: difficulty || 'Medium',
    host: userId,
  });

  const shareLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/battle/private/${battle._id}/lobby`;

  return {
    roomId: battle._id,
    roomCode,
    shareLink
  };
};
