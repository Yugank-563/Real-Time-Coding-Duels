import { findBattleByIdWithPopulated } from '../../repositories/index.js';

export const getBattleDetailsService = async (battleId, userId) => {
  const battle = await findBattleByIdWithPopulated(battleId, [
    'problem',
    { path: 'players.user', select: 'name email rank xp level streaks' }
  ]);

  if (!battle) {
    throw new Error('Battle room not found.');
  }

  // Check if player is part of this battle
  const isPlayer = battle.players.some(p => p.user._id.toString() === userId);
  if (!isPlayer) {
    throw new Error('You are not a participant in this battle.');
  }

  return {
    ...battle.toObject(),
    teammate: null,
    opponents: []
  };
};
