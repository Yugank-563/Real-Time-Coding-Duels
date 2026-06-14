import { findBattleById, updateBattleById } from '../../repositories/index.js';

export const startPrivateBattleService = async (roomId, userId) => {
  const battle = await findBattleById(roomId);
  if (!battle) {
    { const err = new Error('Custom room not found.'); err.status = 404; throw err; }
  }

  if (battle.host.toString() !== userId) {
    { const err = new Error('Only the lobby host can start the battle.'); err.status = 400; throw err; }
  }

  if (battle.players.length < 2) {
    { const err = new Error('Waiting for an opponent to join.'); err.status = 400; throw err; }
  }

  await updateBattleById(battle._id, {
    status: 'active',
    startTime: new Date()
  });

  return {
    roomId: battle._id
  };
};
