import { findBattleById } from '../../repositories/index.js';
import { processBattleResult } from '../ratingService.js';

export const surrenderBattleService = async (battleId, userId) => {
  const battle = await findBattleById(battleId);
  if (!battle) {
    { const err = new Error('Battle room not found.'); err.status = 404; throw err; }
  }

  if (battle.status !== 'active') {
    { const err = new Error('Battle is not active.'); err.status = 400; throw err; }
  }

  const playerIndex = battle.players.findIndex(p => p.user.toString() === userId);
  if (playerIndex === -1) {
    { const err = new Error('You are not a participant in this battle.'); err.status = 403; throw err; }
  }

  // Mark surrendering player status
  battle.players[playerIndex].status = 'surrendered';
  battle.status = 'ended';
  battle.endTime = new Date();

  // Determine the opponent (winner)
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponentId = battle.players[opponentIndex].user.toString();
  battle.winner = opponentId;

  await battle.save();

  // Calculate ELO changes: User surrenders (losses = 0 score), opponent wins (= 1 score)
  const ratingDetails = await processBattleResult(userId, opponentId, 0, battle.mode || 'ranked');

  if (ratingDetails) {
    battle.players[playerIndex].ratingChange = ratingDetails.eloChange || 0;
    battle.players[opponentIndex].ratingChange = ratingDetails.opponent?.eloChange || 0;
    battle.markModified('players'); 
    await battle.save(); 
  }

  return {
    battle,
    ratingDetails
  };
};
