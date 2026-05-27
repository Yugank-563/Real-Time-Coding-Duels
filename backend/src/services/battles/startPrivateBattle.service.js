import { findBattleById } from '../../repositories/index.js';

export const startPrivateBattleService = async (roomId, userId) => {
  const battle = await findBattleById(roomId);
  if (!battle) {
    throw new Error('Custom room not found.');
  }

  if (battle.host.toString() !== userId) {
    throw new Error('Only the lobby host can start the battle.');
  }

  if (battle.players.length < 2) {
    throw new Error('Waiting for an opponent to join.');
  }

  battle.status = 'active';
  battle.startTime = new Date();
  await battle.save();

  return {
    roomId: battle._id
  };
};
