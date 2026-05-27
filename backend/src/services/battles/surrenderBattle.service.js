import { findBattleById } from '../../repositories/index.js';
import { processBattleResult } from '../ratingService.js';

export const surrenderBattleService = async (battleId, userId) => {
  const battle = await findBattleById(battleId);
  if (!battle) {
    throw new Error('Battle room not found.');
  }

  if (battle.status !== 'active') {
    throw new Error('Battle is not active.');
  }

  const playerIndex = battle.players.findIndex(p => p.user.toString() === userId);
  if (playerIndex === -1) {
    throw new Error('You are not a participant in this battle.');
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
  const ratingDetails = await processBattleResult(userId, opponentId, 0);

  return {
    battle,
    ratingDetails
  };
};
