import { findBattleByIdWithPopulated } from '../../repositories/index.js';

export const getBattleDetailsService = async (battleId, userId) => {
  const battle = await findBattleByIdWithPopulated(battleId, [
    'problem',
    { path: 'players.user', select: 'name email rating' }
  ]);

  if (!battle) {
    { const err = new Error('Battle room not found.'); err.status = 404; throw err; }
  }

  // Auto-expire stale waiting lobbies (older than 30 minutes)
  if (battle.status === 'waiting') {
    const ageInMs = Date.now() - new Date(battle.createdAt).getTime();
    if (ageInMs > 30 * 60 * 1000) {
      battle.status = 'ended';
      await battle.save();
      const err = new Error('This battle lobby has expired.'); err.status = 410; throw err;
    }
  }

  // We want guests to be able to fetch basic lobby details so the frontend can display an Access Denied message gracefully.
  const isPlayer = battle.players.some(p => p.user._id.toString() === userId);

  return {
    ...battle.toObject(),
    isParticipant: isPlayer // Let frontend know if they need to formally join
  };
};
