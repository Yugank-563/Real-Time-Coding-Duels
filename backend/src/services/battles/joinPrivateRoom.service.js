import { findBattleByRoomCode } from '../../repositories/index.js';

export const joinPrivateRoomService = async (roomCode, password, userId) => {
  if (!roomCode) {
    throw new Error('Room Code is required.');
  }

  const battle = await findBattleByRoomCode(roomCode.trim().toUpperCase());
  if (!battle) {
    throw new Error('Private custom room not found.');
  }

  if (battle.status !== 'waiting') {
    throw new Error('Lobby is no longer accepting players.');
  }

  if (battle.password && battle.password !== password) {
    throw new Error('Incorrect password.');
  }

  // Check if player is already inside
  const isPlayer = battle.players.some(p => p.user.toString() === userId);
  if (!isPlayer) {
    if (battle.players.length >= 2) {
      throw new Error('Lobby is already full.');
    }
    battle.players.push({ user: userId, status: 'ready' });
    await battle.save();
  }

  return {
    roomId: battle._id,
    roomCode: battle.roomCode
  };
};
