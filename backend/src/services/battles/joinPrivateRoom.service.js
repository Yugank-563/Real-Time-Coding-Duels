import bcrypt from 'bcryptjs';
import { findBattleByRoomCode } from '../../repositories/index.js';

export const joinPrivateRoomService = async (roomCode, password, userId) => {
  if (!roomCode) {
    { const err = new Error('Room Code is required.'); err.status = 400; throw err; }
  }

  const battle = await findBattleByRoomCode(roomCode.trim().toUpperCase());
  if (!battle) {
    { const err = new Error('Private custom room not found.'); err.status = 404; throw err; }
  }

  if (battle.status !== 'waiting') {
    { const err = new Error('Lobby is no longer accepting players.'); err.status = 400; throw err; }
  }

  if (battle.password) {
    if (battle.password.startsWith('$2')) {
      const isValid = await bcrypt.compare(password || '', battle.password);
      if (!isValid) { const err = new Error('Incorrect password.'); err.status = 401; throw err; }
    } else {
      // Backwards compatibility for active rooms with plaintext passwords
      if (battle.password !== password) { const err = new Error('Incorrect password.'); err.status = 401; throw err; }
      
      // Auto-migrate to hash
      battle.password = await bcrypt.hash(password, 10);
      await battle.save();
    }
  }

  // Check if player is already inside
  const isPlayer = battle.players.some(p => p.user.toString() === userId);
  if (!isPlayer) {
    if (battle.players.length >= 2) {
      { const err = new Error('Lobby is already full.'); err.status = 400; throw err; }
    }
    battle.players.push({ user: userId, status: 'ready' });
    await battle.save();
  }

  return {
    roomId: battle._id,
    roomCode: battle.roomCode
  };
};
