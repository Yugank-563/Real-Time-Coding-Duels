import Battle from '../../../backend/src/models/Battle.js';
import { processBattleResult } from '../../../backend/src/services/ratingService.js';
 
export const registerBattleHandlers = (io, socket) => {
 
  // 1. Join battle room channel
  socket.on('battle:join', async (data) => {
    try {
      const { battleId } = data;
      if (!battleId) return;
 
      const roomName = `battle:${battleId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
 
      const battle = await Battle.findById(battleId);
      if (!battle) {
        socket.emit('error', { message: 'Battle room not found.' });
        return;
      }
 
      // Critical validation: reject joining ended battles
      if (battle.status === 'ended') {
        socket.emit('battle:error', { 
          message: 'Battle has already concluded.',
          redirect: `/battle/${battleId}/summary` 
        });
        return;
      }

      // Check if user is player vs spectator
      const isPlayer = battle.players.some(p => p.user.toString() === socket.userId);
      if (isPlayer) {
        // Player joined
        socket.to(roomName).emit('battle:player_joined', { userId: socket.userId });
 
        // If it is a team battle, join team room (Team battles not yet implemented)
        if (battle.battleType === 'team') {
          console.log(`[Battle] Team battle mode not yet implemented — skipping team room join.`);
        }
      } else {
        // Spectator joined
        socket.to(roomName).emit('battle:spectator_joined', { userId: socket.userId });
      }

    } catch (err) {
      console.error('battle:join error:', err.message);
    }
  });

  // 2. Broadcast active typing status to opponent
  socket.on('battle:code_change', (data) => {
    const { battleId, language } = data;
    if (!battleId) return;

    const roomName = `battle:${battleId}`;
    
    // Broadcast opponent state update (e.g. status: "Coding...") to room
    socket.to(roomName).emit('battle:opponent_coding', {
      userId: socket.userId,
      language,
    });
  });

  // 3. Trigger manual countdown start
  socket.on('battle:start_countdown', async (data) => {
    const { battleId } = data;
    if (!battleId) return;

    const roomName = `battle:${battleId}`;
    io.to(roomName).emit('battle:start');
    console.log(`Broadcasted countdown start for battle room ${battleId}`);

    try {
      const battle = await Battle.findById(battleId);
      if (battle && battle.battleType === 'sprint') {
        console.log(`Setting a 300s server-side timeout for Timed Sprint battle: ${battleId}`);
        setTimeout(async () => {
          try {
            const freshBattle = await Battle.findById(battleId);
            if (!freshBattle || freshBattle.status === 'ended') return;

            // Mark battle ended
            freshBattle.status = 'ended';
            freshBattle.endTime = new Date();

            const p1 = freshBattle.players[0];
            const p2 = freshBattle.players[1];
            let winnerId = null;

            if (p1.progress > p2.progress) {
              winnerId = p1.user.toString();
            } else if (p2.progress > p1.progress) {
              winnerId = p2.user.toString();
            } else {
              winnerId = null; // Draw
            }

            freshBattle.winner = winnerId;
            await freshBattle.save();

            let eloDetails = null;
            if (winnerId) {
              const loserId = winnerId === p1.user.toString() ? p2.user.toString() : p1.user.toString();
              eloDetails = await processBattleResult(loserId, winnerId, 0); // 0 score for loser
            }

            // Emit completion
            io.to(roomName).emit('battle:end', {
              winnerId,
              ratingDetails: eloDetails,
              reason: 'Timeout'
            });

            console.log(`Sprint Battle ${battleId} resolved by server-side timeout. Winner: ${winnerId}`);
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
  socket.on('battle:surrender', async (data) => {
    try {
      const { battleId } = data;
      if (!battleId) return;

      const battle = await Battle.findById(battleId);
      if (!battle || battle.status !== 'active') return;

      const playerIdx = battle.players.findIndex(p => p.user.toString() === socket.userId);
      if (playerIdx === -1) return;

      // Update state
      battle.players[playerIdx].status = 'surrendered';
      battle.status = 'ended';
      battle.endTime = new Date();

      const opponentIdx = playerIdx === 0 ? 1 : 0;
      const opponentId = battle.players[opponentIdx].user.toString();
      battle.winner = opponentId;

      await battle.save();

      // Process Elo calculations: Surrendering user (loss = 0), opponent (win = 1)
      const eloDetails = await processBattleResult(socket.userId, opponentId, 0);

      // Broadcast battle completion
      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:end', {
        winnerId: opponentId,
        ratingDetails: eloDetails,
      });

      console.log(`Battle ${battleId} resolved by surrender. Winner: ${opponentId}`);
    } catch (err) {
      console.error('battle:surrender error:', err.message);
    }
  });
 
  // 5. Handle player client-side timeout
  socket.on('battle:timeout', async (data) => {
    try {
      const { battleId } = data;
      if (!battleId) return;
 
      const battle = await Battle.findById(battleId);
      if (!battle || battle.status !== 'active') return;
 
      // Mark battle ended
      battle.status = 'ended';
      battle.endTime = new Date();
 
      const p1 = battle.players[0];
      const p2 = battle.players[1];
      let winnerId = null;
 
      if (p1.progress > p2.progress) {
        winnerId = p1.user.toString();
      } else if (p2.progress > p1.progress) {
        winnerId = p2.user.toString();
      } else {
        winnerId = null; // Draw
      }
 
      battle.winner = winnerId;
      await battle.save();
 
      let eloDetails = null;
      if (winnerId) {
        const loserId = winnerId === p1.user.toString() ? p2.user.toString() : p1.user.toString();
        eloDetails = await processBattleResult(loserId, winnerId, 0); // 0 score for loser
      }
 
      const roomName = `battle:${battleId}`;
      io.to(roomName).emit('battle:end', {
        winnerId,
        ratingDetails: eloDetails,
        reason: 'Timeout'
      });
 
      console.log(`Battle ${battleId} resolved by client-side timeout. Winner: ${winnerId}`);
    } catch (err) {
      console.error('battle:timeout error:', err.message);
    }
  });
};
