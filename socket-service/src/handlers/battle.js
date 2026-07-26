import Battle from '../../../backend/src/models/Battle.js';
import Submission from '../../../backend/src/models/Submission.js';
import { processBattleResult } from '../../../backend/src/services/ratingService.js';
import { battleSocketSchema } from '../schemas/socket.schema.js';
import { validateSocketPayload } from '../utils/validation.js';

// Helper to verify participant and fetch battle
const verifyParticipant = async (battleId, userId, actionName) => {
  if (!battleId) return null;
  const battle = await Battle.findById(battleId);
  if (!battle) return null;

  const playerIdx = battle.players.findIndex(p => p.user.toString() === userId);
  if (playerIdx === -1) {
    return null;
  }
  return { battle, playerIdx };
};

// Helper for automatic lobby cleanup when host leaves before start
const handleLobbyCleanup = async (battleId, userId, io) => {
  try {
    const battle = await Battle.findById(battleId);
    // Verify battle exists and has NOT started
    if (!battle || battle.status !== 'waiting') return;

    // Check if the user leaving is the Host
    if (battle.host.toString() === userId.toString()) {
      // Mark lobby as closed ('ended' is valid in Mongoose schema enum)
      battle.status = 'ended';
      await battle.save();

      const roomName = `battle:${battleId}`;
      
      // Notify every remaining participant
      io.to(roomName).emit('battle:lobby_closed', {
        message: 'The host has left the lobby. The battle has been cancelled.',
        battleId
      });

      // Automatically remove every participant from the Socket room
      io.in(roomName).socketsLeave(roomName);
      
    } else {
      // It's the guest leaving
      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:guest_left', {
        message: 'The opponent has left the lobby.',
        userId
      });
    }
  } catch (err) {
    console.error('Lobby cleanup error:', err.message);
  }
};



// Helper to resolve timeouts and ELO calculations
const resolveBattleTimeout = async (battle, io, reason = 'Timeout') => {
  battle.status = 'ended';
  battle.endTime = new Date();

  if (battle.winner) {
    await battle.save();
    const roomName = `battle:${battle._id.toString()}`;
    io.to(roomName).emit('battle:end', {
      winnerId: battle.winner,
      reason
    });
    return;
  }

  const p1 = battle.players[0];
  const p2 = battle.players[1];
  let winnerId = null; 

  battle.winner = winnerId;
  await battle.save();

  // Compute stats and rating for all matches
  let ratingDetails = null;
  try {
    const p1Id = p1.user.toString();
    const p2Id = p2.user.toString();
    const score = winnerId === p1Id ? 1 : winnerId === p2Id ? 0 : 0.5;
    ratingDetails = await processBattleResult(p1Id, p2Id, score, battle.mode || 'ranked');

    if (ratingDetails) {
      battle.players[0].ratingChange = ratingDetails.eloChange || 0;
      battle.players[1].ratingChange = ratingDetails.opponent?.eloChange || 0;
      battle.markModified('players');
      await battle.save();
    }
  } catch (eloErr) {
    console.error('Stats processing failed after timeout:', eloErr.message);
  }

  const roomName = `battle:${battle._id.toString()}`;
  io.to(roomName).emit('battle:end', {
    winnerId,
    ratingDetails,
    reason
  });
};

export const registerBattleHandlers = (io, socket) => {
 
  // 1. Join battle room channel
  socket.on('battle:join', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:join');
      if (!data) return;

      const { battleId } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:join');
      if (!verify) {
        socket.emit('error', { message: 'You are not a participant in this battle room.' });
        return;
      }
      const { battle } = verify;
 
      const roomName = `battle:${battleId}`;
      socket.join(roomName);
      socket.currentBattleId = battleId; // Track current lobby for disconnect cleanup

      // Critical validation: reject joining ended battles
      if (battle.status === 'ended' || battle.status === 'cancelled') {
        const hasSurrendered = battle.players.some(p => p.status === 'surrendered');
        socket.emit('battle:error', { 
          message: 'Battle has already concluded or was cancelled.',
          redirect: hasSurrendered ? '/' : `/battle/${battleId}/summary` 
        });
        return;
      }
 
      // Player joined
      socket.to(roomName).emit('battle:player_joined', { userId: socket.userId });

    } catch (err) {
      console.error('battle:join error:', err.message);
    }
  });

  // Handle explicit lobby leave
  socket.on('battle:leave_lobby', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:leave_lobby');
      if (!data) return;
      
      const { battleId } = data;
      
      if (socket.currentBattleId === battleId) {
        delete socket.currentBattleId;
      }
      socket.leave(`battle:${battleId}`);

      await handleLobbyCleanup(battleId, socket.userId, io);
    } catch (err) {
      console.error('battle:leave_lobby error:', err.message);
    }
  });

  // Handle player ready toggle
  socket.on('battle:player_ready', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:player_ready');
      if (!data) return;

      const { battleId, isReady } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:player_ready');
      if (!verify) return;

      const { battle, playerIdx } = verify;
      if (battle.status !== 'waiting') return;

      // Update in DB
      battle.players[playerIdx].status = isReady ? 'ready' : 'not_ready';
      await battle.save();

      // Broadcast to room
      io.to(`battle:${battleId}`).emit('battle:player_ready', {
        userId: socket.userId,
        isReady
      });
    } catch (err) {
      console.error('battle:player_ready error:', err.message);
    }
  });

  // Handle implicit disconnects (browser close, network drop)
  socket.on('disconnect', async () => {
    if (socket.currentBattleId) {
      await handleLobbyCleanup(socket.currentBattleId, socket.userId, io);
    }
  });

  // 3. Trigger manual countdown start
  socket.on('battle:start_countdown', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:start_countdown');
      if (!data) return;

      const { battleId } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:start_countdown');
      if (!verify) return;
      const { battle } = verify;

      // Set the true start time to 8.5 seconds in the future (to account for UI countdown)
      battle.startTime = new Date(Date.now() + 8500);
      await battle.save();

      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:start', { startTime: battle.startTime });

      if (battle.timeLimit) {
        const timeoutMs = (battle.timeLimit * 1000) + 8500;
        setTimeout(async () => {
          try {
            const freshBattle = await Battle.findById(battleId);
            if (!freshBattle || freshBattle.status === 'ended') return;

            await resolveBattleTimeout(freshBattle, io, 'Server-side timeout');
          } catch (timeoutErr) {
            console.error('Timeout resolution error:', timeoutErr);
          }
        }, timeoutMs); 
      }
    } catch (err) {
      console.error('Sprint timeout set error:', err.message);
    }
  });

  // 4. Handle player surrendering
  socket.on('battle:surrender', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:surrender');
      if (!data) return;

      const { battleId } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:surrender');
      if (!verify) return;
      const { battle, playerIdx } = verify;

      if (battle.status !== 'active') return;

      // Update state
      battle.players[playerIdx].status = 'surrendered';
      battle.status = 'ended';
      battle.endTime = new Date();

      const opponentIdx = playerIdx === 0 ? 1 : 0;
      const opponentId = battle.players[opponentIdx].user.toString();

      if (!battle.winner) {
        battle.winner = opponentId;
        battle.markModified('players');
        await battle.save();

        // Process Stats: surrendering user loses (0), opponent wins (1)
        let ratingDetails = null;
        try {
          ratingDetails = await processBattleResult(socket.userId, opponentId, 0, battle.mode || 'ranked');
          if (ratingDetails) {
            battle.players[playerIdx].ratingChange = ratingDetails.eloChange || 0;
            battle.players[opponentIdx].ratingChange = ratingDetails.opponent?.eloChange || 0;
            battle.markModified('players');
            await battle.save();
          }
        } catch (eloErr) {
          console.error('Stats processing failed after surrender:', eloErr.message);
        }

        const roomName = `battle:${battleId}`;
        io.to(roomName).emit('battle:end', {
          winnerId: opponentId,
          ratingDetails,
          reason: 'Surrender'
        });
      } else {
        // Winner already decided, just end the room for the remaining player
        battle.markModified('players');
        await battle.save();
        const roomName = `battle:${battleId}`;
        io.to(roomName).emit('battle:end', {
          winnerId: battle.winner,
          reason: 'Surrender'
        });
      }
    } catch (err) {
      console.error('battle:surrender error:', err.message);
    }
  });
 
  // 5. Handle player client-side timeout
  socket.on('battle:timeout', async (raw_data) => {
    try {
      const data = validateSocketPayload(battleSocketSchema, raw_data, socket, 'battle:timeout');
      if (!data) return;

      const { battleId } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:timeout');
      if (!verify) return;
      const { battle } = verify;

      if (battle.status !== 'active') return;
      
      // Server-side time validation — only accept timeout when time limit has been reached
      if (battle.startTime) {
        const timeElapsedMs = Date.now() - new Date(battle.startTime).getTime();
        const timeLimitMs = (battle.timeLimit || 1200) * 1000;
        if (timeElapsedMs < timeLimitMs) {
          return;
        }
      }

      await resolveBattleTimeout(battle, io, 'Client-side timeout');
    } catch (err) {
      console.error('battle:timeout error:', err.message);
    }
  });
};
