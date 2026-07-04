import { findBattleById } from '../../repositories/index.js';
import redis from '../../config/redis.js';

export const readyPrivateBattleService = async (battleId, userId) => {
  const battle = await findBattleById(battleId);
  
  if (!battle) {
    const err = new Error('Battle not found'); err.status = 404; throw err;
  }
  
  if (battle.status !== 'waiting') {
    const err = new Error('Battle already started or finished'); err.status = 400; throw err;
  }
  
  const player = battle.players.find(p => p.user.toString() === userId.toString());
  if (!player) {
    const err = new Error('You are not a participant in this battle'); err.status = 403; throw err;
  }
  
  player.status = 'ready';
  await battle.save();
  
  // Publish a redis event to notify all users in the battle room via socket
  redis.publish('battle:events', JSON.stringify({
    battleId: battle._id.toString(),
    event: 'battle:player_ready',
    data: { userId, status: 'ready' }
  })).catch(console.error);
  
  return { success: true, message: 'Player ready' };
};
