import { findUserById, updateUserById } from '../repositories/index.js';

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
 * Process ratings and stats after a battle.
 * @param {string} userId - Player A ID
 * @param {string} opponentId - Player B ID
 * @param {number} actualScore - 1 for Win, 0 for Loss, 0.5 for Draw
 * @param {string} mode - 'ranked' or 'casual'
 */
export const processBattleResult = async (userId, opponentId, actualScore, mode = 'ranked') => {
  const user = await findUserById(userId);
  const opponent = await findUserById(opponentId);

  if (!user || !opponent) {
    { const err = new Error('User or opponent not found during processing'); err.status = 404; throw err; }
  }

  if (mode === 'casual') {
    // ── Casual Match ──
    const userUpdate = {
      $inc: { 'casualStats.totalBattles': 1 }
    };
    if (actualScore === 1) userUpdate.$inc['casualStats.wins'] = 1;
    else if (actualScore === 0) userUpdate.$inc['casualStats.losses'] = 1;
    else userUpdate.$inc['casualStats.draws'] = 1;

    const oppUpdate = {
      $inc: { 'casualStats.totalBattles': 1 }
    };
    if (actualScore === 1) oppUpdate.$inc['casualStats.losses'] = 1; // opponent lost
    else if (actualScore === 0) oppUpdate.$inc['casualStats.wins'] = 1;
    else oppUpdate.$inc['casualStats.draws'] = 1;

    await updateUserById(userId, userUpdate);
    await updateUserById(opponentId, oppUpdate);

    return {
      userId,
      username: user.username || user.email.split('@')[0],
      oldElo: user.rank || 1200,
      newElo: user.rank || 1200,
      eloChange: 0,
      opponent: {
        userId: opponentId,
        username: opponent.username || opponent.email.split('@')[0],
        oldElo: opponent.rank || 1200,
        newElo: opponent.rank || 1200,
        eloChange: 0,
      }
    };
  }

  // ── Ranked Match ──
  const myElo = user.rank || 1200;
  const oppElo = opponent.rank || 1200;

  // 1. Calculate Elo Change
  const { newElo: myNewElo, change: myEloChange } = calculateElo(myElo, oppElo, actualScore);
  const { newElo: oppNewElo, change: oppEloChange } = calculateElo(oppElo, myElo, 1 - actualScore);

  // 2. Update Player A (User)
  await updateUserById(userId, { rank: myNewElo });

  // 3. Update Player B (Opponent)
  await updateUserById(opponentId, { rank: oppNewElo });

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
