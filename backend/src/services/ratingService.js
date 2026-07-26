import { findUserById, updateUserById } from '../repositories/index.js';

// Calculates new Elo rating
const calculateElo = (myElo, opponentElo, actualScore, K = 32) => {
  // Scaling factor changed from 400 to 800. 
  // This causes a 20-point Elo difference to act mathematically identical to a 10-point difference.
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - myElo) / 800));
  const newElo = Math.round(myElo + K * (actualScore - expectedScore));
  return {
    newElo,
    change: newElo - myElo,
  };
};

// Process ratings/stats after battle
export const processBattleResult = async (userId, opponentId, actualScore, mode = 'ranked', options = {}) => {
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

  // Determine K-Factor based on Speed Bonus if applicable
  let K = 24; // Default normal
  if (options.timeElapsed && options.timeLimit) {
    const timePercentage = options.timeElapsed / options.timeLimit;
    if (timePercentage <= 0.20) {
      K = 32; // Godlike Speed
    } else if (timePercentage <= 0.40) {
      K = 28; // Very Fast
    } else if (timePercentage <= 0.60) {
      K = 24; // Normal Speed
    } else if (timePercentage <= 0.80) {
      K = 20; // Slow
    } else {
      K = 16; // Very Slow/Struggled
    }
  }

  // 1. Calculate Elo Change
  let myNewElo, myEloChange, oppNewElo, oppEloChange;
  if (actualScore === 0.5) {
    // Draw -> Strict 0 rating change
    myNewElo = myElo;
    myEloChange = 0;
    oppNewElo = oppElo;
    oppEloChange = 0;
  } else {
    const myResult = calculateElo(myElo, oppElo, actualScore, K);
    const oppResult = calculateElo(oppElo, myElo, 1 - actualScore, K);
    myNewElo = myResult.newElo;
    myEloChange = myResult.change;
    oppNewElo = oppResult.newElo;
    oppEloChange = oppResult.change;
  }

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
