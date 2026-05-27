import User from '../../../backend/src/models/User.js';

export const registerChatHandlers = (io, socket) => {
  
  // 1. Deliver real-time chat messages
  socket.on('chat:message', async (data) => {
    try {
      const { battleId, message, scope, teamId } = data;
      if (!battleId || !message) return;
 
      const user = await User.findById(socket.userId);
      const username = user ? (user.name || user.email.split('@')[0]) : 'Player';
 
      const timestamp = new Date();
 
      let targetRoom = `battle:${battleId}`;
      if (scope === 'team' && teamId) {
        targetRoom = `battle:${battleId}:team:${teamId}`;
      }
 
      // Broadcast message to targeted room
      io.to(targetRoom).emit('chat:message', {
        userId: socket.userId,
        username,
        message,
        timestamp,
        scope: scope || 'all',
      });
 
      console.log(`Chat delivery in room ${targetRoom}: [${username}]: "${message}" (scope=${scope || 'all'})`);
    } catch (err) {
      console.error('chat:message error:', err.message);
    }
  });
};
