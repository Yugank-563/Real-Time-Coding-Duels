import { findUserById, updateUserById } from '../repositories/index.js';

// Calculates new Elo rating
const calculateElo = (myElo, opponentElo, actualScore, K = 32) => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 400));
  const newElo = Math.round(myElo + K * (actualScore - expectedScore));
  return {
    newElo,
    change: newElo - myElo,
  };
};

// Process ratings/stats after battle
export const processBattleResult = async (userId, opponentId, actualScore, mode = 'ranked') => {
  const user = await findUserById(userId);
  const opponent = await findUserById(opponentId);

  if (!user || !opponent) {
    { const err = new Error('User or opponent not found during processing'); err.status = 404; throw err; }
  }

  if (mode === 'casual') {
    // Casual Match

    return {
      userId,
      username: user.username || user.email.split('@')[0],
      oldElo: user.rating || 1200,
      newElo: user.rating || 1200,
      eloChange: 0,
      opponent: {
        userId: opponentId,
        username: opponent.username || opponent.email.split('@')[0],
        oldElo: opponent.rating || 1200,
        newElo: opponent.rating || 1200,
        eloChange: 0,
      }
    };
  }

  // Ranked Match
  const myElo = user.rating || 1200;
  const oppElo = opponent.rating || 1200;

  // 1. Calculate Elo Change
  const { newElo: myNewElo, change: myEloChange } = calculateElo(myElo, oppElo, actualScore);
  const { newElo: oppNewElo, change: oppEloChange } = calculateElo(oppElo, myElo, 1 - actualScore);

  // 2. Update Player A (User)
  await updateUserById(userId, { rating: myNewElo });

  // 3. Update Player B (Opponent)
  await updateUserById(opponentId, { rating: oppNewElo });

  return {
    userId,
    username: user.username || user.email.split('@')[0],
    oldElo: myElo,
    newElo: myNewElo,
    eloChange: myEloChange,
    opponent: {
      userId: opponentId,
      username: opponent.username || opponent.email.split('@')[0],
      oldElo: oppElo,
      newElo: oppNewElo,
      eloChange: oppEloChange,
    }
  };
};
