import Battle from '../../../backend/src/models/Battle.js';
import Submission from '../../../backend/src/models/Submission.js';
import { processBattleResult } from '../../../backend/src/services/ratingService.js';
import { battleSocketSchema, codeChangeSocketSchema } from '../schemas/socket.schema.js';
import { validateSocketPayload } from '../utils/validation.js';

// Helper to verify participant and fetch battle
const verifyParticipant = async (battleId, userId, actionName) => {
  if (!battleId) return null;
  const battle = await Battle.findById(battleId);
  if (!battle) return null;

  const playerIdx = battle.players.findIndex(p => p.user.toString() === userId);
  if (playerIdx === -1) {
    console.warn(`[Security] User ${userId} attempted unauthorized socket action: ${actionName} on battle ${battleId}`);
    return null;
  }
  return { battle, playerIdx };
};


// Helper to resolve timeouts and ELO calculations
const resolveBattleTimeout = async (battle, io, reason = 'Timeout') => {
  battle.status = 'ended';
  battle.endTime = new Date();

  const p1 = battle.players[0];
  const p2 = battle.players[1];
  let winnerId = null; 

  try {
    const p1Sub = await Submission.findOne({ userId: p1.user, problemId: battle.problem }).sort({ createdAt: -1 });
    const p2Sub = await Submission.findOne({ userId: p2.user, problemId: battle.problem }).sort({ createdAt: -1 });

    // Fallback to 50 if no submission found to be safe
    const p1Total = p1Sub?.totalTestCases || 50;
    const p2Total = p2Sub?.totalTestCases || 50;

    const p1Percent = p1Total > 0 ? p1.progress / p1Total : 0;
    const p2Percent = p2Total > 0 ? p2.progress / p2Total : 0;

    if (p1Percent >= 0.5 || p2Percent >= 0.5) {
      if (p1.progress > p2.progress) {
        winnerId = p1.user.toString();
      } else if (p2.progress > p1.progress) {
        winnerId = p2.user.toString();
      }
    }
  } catch (err) {
    console.error('Error calculating 50% threshold for timeout win:', err);
  }

  battle.winner = winnerId;
  await battle.save();

  // Always compute ELO: win=1.0, loss=0.0, draw=0.5
  let ratingDetails = null;
  try {
    if (!battle.isCasual) {
      const p1Id = p1.user.toString();
      const p2Id = p2.user.toString();
      const score = winnerId === p1Id ? 1 : winnerId === p2Id ? 0 : 0.5;
      ratingDetails = await processBattleResult(p1Id, p2Id, score);
    }
  } catch (eloErr) {
    console.error('ELO processing failed after timeout:', eloErr.message);
  }

  const roomName = `battle:${battle._id.toString()}`;
  io.to(roomName).emit('battle:end', {
    winnerId,
    ratingDetails,
    reason
  });

  console.log(`Battle ${battle._id.toString()} resolved by ${reason.toLowerCase()}. Winner: ${winnerId ?? 'Draw'}`);
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
      console.log(`Socket ${socket.id} joined room ${roomName}`);
 
      // Critical validation: reject joining ended battles
      if (battle.status === 'ended') {
        socket.emit('battle:error', { 
          message: 'Battle has already concluded.',
          redirect: `/battle/${battleId}/summary` 
        });
        return;
      }
 
      // Player joined
      socket.to(roomName).emit('battle:player_joined', { userId: socket.userId });

      // If it is a team battle, join team room (Team battles not yet implemented)
      if (battle.battleType === 'team') {
        console.log(`[Battle] Team battle mode not yet implemented — skipping team room join.`);
      }
    } catch (err) {
      console.error('battle:join error:', err.message);
    }
  });

  // 2. Broadcast active typing status to opponent
  socket.on('battle:code_change', async (raw_data) => {
    try {
      const data = validateSocketPayload(codeChangeSocketSchema, raw_data, socket, 'battle:code_change');
      if (!data) return;

      const { battleId, language } = data;
      const verify = await verifyParticipant(battleId, socket.userId, 'battle:code_change');
      if (!verify) return;

      const roomName = `battle:${battleId}`;
      
      // Broadcast opponent state update (e.g. status: "Coding...") to room
      socket.to(roomName).emit('battle:opponent_coding', {
        userId: socket.userId,
        language,
      });
    } catch (err) {
      console.error('battle:code_change error:', err.message);
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

      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:start');
      console.log(`Broadcasted countdown start for battle room ${battleId}`);

      if (battle.battleType === 'sprint') {
        console.log(`Setting a 300s server-side timeout for Timed Sprint battle: ${battleId}`);
        setTimeout(async () => {
          try {
            const freshBattle = await Battle.findById(battleId);
            if (!freshBattle || freshBattle.status === 'ended') return;

            await resolveBattleTimeout(freshBattle, io, 'Server-side timeout');
          } catch (timeoutErr) {
            console.error('Server sprint timeout callback error:', timeoutErr.message);
          }
        }, 300000); // 5 minutes
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
      battle.winner = opponentId;

      await battle.save();

      // Process Elo: surrendering user loses (0), opponent wins (1)
      let ratingDetails = null;
      try {
        if (!battle.isCasual) {
          ratingDetails = await processBattleResult(socket.userId, opponentId, 0);
        }
      } catch (eloErr) {
        console.error('ELO processing failed after surrender:', eloErr.message);
      }

      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:end', {
        winnerId: opponentId,
        ratingDetails,
      });

      console.log(`Battle ${battleId} resolved by surrender. Winner: ${opponentId}`);
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
      
      // Server-side time validation
      if (battle.startTime) {
        const timeElapsedMs = Date.now() - new Date(battle.startTime).getTime();
        const timeLimitMs = (battle.timeLimit || 1200) * 1000;
        // Allow 5 seconds of grace period for network delays
        if (timeElapsedMs < (timeLimitMs - 5000)) {
          console.warn(`[Security] Client ${socket.userId} attempted early timeout on ${battleId}. Elapsed: ${timeElapsedMs}ms, Required: ${timeLimitMs}ms`);
          return;
        }
      }

      await resolveBattleTimeout(battle, io, 'Client-side timeout');
    } catch (err) {
      console.error('battle:timeout error:', err.message);
    }
  });
};
