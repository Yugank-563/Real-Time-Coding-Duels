import { User } from '../models/index.js';

/**
 * Calculates new Elo ratings for two players after a battle.
 * Formula:
 * Expected = 1 / (1 + 10^((opponentElo - myElo) / 400))
 * NewElo = OldElo + K * (actualScore - expectedScore)
 */
export const calculateElo = (myElo, opponentElo, actualScore, K = 32) => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 400));
  const newElo = Math.round(myElo + K * (actualScore - expectedScore));
  return {
    newElo,
    change: newElo - myElo,
  };
};

/**
 * Process the XP, level ups, and ratings after a battle.
 * @param {string} userId - Player A ID
 * @param {string} opponentId - Player B ID
 * @param {number} actualScore - 1 for Win, 0 for Loss, 0.5 for Draw
 * @param {object} bonuses - { isPerfect: boolean, isFastSolve: boolean }
 */
export const processBattleResult = async (userId, opponentId, actualScore, bonuses = {}) => {
  const user = await User.findById(userId);
  const opponent = await User.findById(opponentId);

  if (!user || !opponent) {
    throw new Error('User or opponent not found during Elo processing');
  }

  const myElo = user.rank || 1200;
  const oppElo = opponent.rank || 1200;

  // 1. Calculate Elo Change
  const { newElo: myNewElo, change: myEloChange } = calculateElo(myElo, oppElo, actualScore);
  const { newElo: oppNewElo, change: oppEloChange } = calculateElo(oppElo, myElo, 1 - actualScore);

  // 2. Calculate XP
  let xpEarned = 15; // Loss XP
  if (actualScore === 1) {
    xpEarned = 50; // Win XP
  } else if (actualScore === 0.5) {
    xpEarned = 25; // Draw XP
  }

  // Apply bonuses
  if (bonuses.isPerfect) xpEarned += 30;
  if (bonuses.isFastSolve) xpEarned += 20;

  // 3. Update Player A (User)
  user.rank = myNewElo;
  
  // Initialize user xp/level if missing
  const oldXp = user.xp || 0;
  const newXp = oldXp + xpEarned;
  user.xp = newXp;

  // Let's assume 1000 XP per level
  const oldLevel = user.level || 1;
  const newLevel = Math.floor(newXp / 1000) + 1;
  user.level = newLevel;

  const isLevelUp = newLevel > oldLevel;

  // Track streaks
  if (actualScore === 1) {
    user.streaks = (user.streaks || 0) + 1;
  } else if (actualScore === 0) {
    user.streaks = 0; // reset
  }

  await user.save();

  // 4. Update Player B (Opponent)
  opponent.rank = oppNewElo;
  let oppXpEarned = actualScore === 1 ? 15 : actualScore === 0 ? 50 : 25;
  opponent.xp = (opponent.xp || 0) + oppXpEarned;
  opponent.level = Math.floor(opponent.xp / 1000) + 1;
  if (actualScore === 0) {
    opponent.streaks = (opponent.streaks || 0) + 1;
  } else if (actualScore === 1) {
    opponent.streaks = 0;
  }
  await opponent.save();

  return {
    userId,
    username: user.username || user.email.split('@')[0],
    oldElo: myElo,
    newElo: myNewElo,
    eloChange: myEloChange,
    xpEarned,
    newXp,
    level: newLevel,
    isLevelUp,
    opponent: {
      userId: opponentId,
      username: opponent.username || opponent.email.split('@')[0],
      oldElo: oppElo,
      newElo: oppNewElo,
      eloChange: oppEloChange,
    }
  };
};
