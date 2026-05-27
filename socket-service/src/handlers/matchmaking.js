import { 
  addToQueue, 
  removeFromQueue, 
  findMatch, 
  getQueuePosition,
  handleTopicQueue,
  findTopicMatch,
  removeFromTopicQueue,
} from '../../../backend/src/services/matchmakingService.js';
import User from '../../../backend/src/models/User.js';
import Problem from '../../../backend/src/models/Problem.js';
import Battle from '../../../backend/src/models/Battle.js';

// Cache active intervals keyed by socket.id to prevent leaks
const activeQueueIntervals = new Map();

// Map userId → socketId so we can stop the matched user's interval
const userSocketMap = new Map();

export const registerMatchmakingHandlers = (io, socket) => {

  // Track socket for this user (update on each connection)
  userSocketMap.set(socket.userId, socket.id);

  /**
   * Helper: stop the matchmaking interval for a given userId.
   * Used when that user is matched by someone else, so their own
   * interval doesn't keep running after the match is emitted.
   */
  const stopIntervalForUser = (userId) => {
    const targetSocketId = userSocketMap.get(userId);
    if (targetSocketId && activeQueueIntervals.has(targetSocketId)) {
      clearInterval(activeQueueIntervals.get(targetSocketId));
      activeQueueIntervals.delete(targetSocketId);
      console.log(`Stopped stale matchmaking interval for matched user ${userId}`);
    }
  };

  // 1. Join matchmaking queue
  socket.on('matchmaking:join', async (data) => {
    try {
      const { battleType, topic } = data;
      const userId = socket.userId;

      if (!battleType) {
        socket.emit('error', { message: 'battleType is required.' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        socket.emit('error', { message: 'User profile not found.' });
        return;
      }

      const myElo = user.rank || 1200;

      // Add to Redis queue
      if (battleType === 'topic') {
        if (!topic) {
          socket.emit('error', { message: 'Topic is required for topic battles.' });
          return;
        }
        await handleTopicQueue(userId, myElo, topic);
        console.log(`[Matchmaking] User ${userId} (Elo: ${myElo}) joined TOPIC queue: ${topic}`);
      } else {
        await addToQueue(userId, myElo, battleType);
        console.log(`[Matchmaking] User ${userId} (Elo: ${myElo}) joined ${battleType} queue`);
      }

      // Clear any pre-existing interval for this socket (re-join case)
      if (activeQueueIntervals.has(socket.id)) {
        clearInterval(activeQueueIntervals.get(socket.id));
        activeQueueIntervals.delete(socket.id);
      }

      let elapsedSeconds = 0;
      let eloTolerance = (battleType === 'topic') ? 150 : 100;

      // Start periodic pairing loop (every 2 seconds)
      const matchmakingInterval = setInterval(async () => {
        try {
          elapsedSeconds += 2;

          // Progressively expand Elo search range
          const expandEvery = (battleType === 'topic') ? 15 : 10;
          if (elapsedSeconds % expandEvery === 0) {
            eloTolerance += 50;
            console.log(`[Matchmaking] Expanding Elo range for ${userId}: ±${eloTolerance}`);
          }

          if (battleType === 'topic') {
            // ── TOPIC MATCHMAKING ──
            const matchedUserId = await findTopicMatch(userId, myElo, topic, eloTolerance);

            if (matchedUserId) {
              clearInterval(matchmakingInterval);
              activeQueueIntervals.delete(socket.id);
              stopIntervalForUser(matchedUserId); // Stop opponent's interval too

              const opponent = await User.findById(matchedUserId);

              // Find topic-filtered problem
              let problems = await Problem.find({ tags: { $regex: topic, $options: 'i' } });
              if (problems.length === 0) problems = await Problem.find({});
              if (problems.length === 0) {
                socket.emit('error', { message: 'No coding challenges exist in system.' });
                return;
              }
              const randomProblem = problems[Math.floor(Math.random() * problems.length)];

              const battle = await Battle.create({
                players: [
                  { user: userId, status: 'ready' },
                  { user: matchedUserId, status: 'ready' },
                ],
                problem: randomProblem._id,
                battleType: 'topic',
                topic,
                status: 'active',
                startTime: new Date(),
              });

              const battleIdStr = battle._id.toString();
              console.log(`[Matchmaking] ✅ Topic Battle created: ${battleIdStr} | ${userId} vs ${matchedUserId} | topic: ${topic}`);

              const myData = {
                battleId: battleIdStr,
                battleType: 'topic',
                topic,
                opponent: {
                  username: opponent?.name || opponent?.email?.split('@')[0] || 'Opponent',
                  elo: opponent?.rank || 1200,
                  level: opponent?.level || 1,
                },
              };

              const opponentData = {
                battleId: battleIdStr,
                battleType: 'topic',
                topic,
                opponent: {
                  username: user.name || user.email.split('@')[0],
                  elo: myElo,
                  level: user.level || 1,
                },
              };

              io.to(`user:${userId}`).emit('matchmaking:found', myData);
              io.to(`user:${matchedUserId}`).emit('matchmaking:found', opponentData);

            } else {
              // No match yet — send wait update
              if (elapsedSeconds >= 60) {
                socket.emit('matchmaking:topic_timeout', { topic });
              }
              socket.emit('matchmaking:position', {
                position: 1,
                estimatedWait: Math.max(10, 60 - elapsedSeconds),
                elapsedSeconds,
              });
            }

          } else {
            // ── STANDARD MATCHMAKING (1v1, sprint, etc.) ──
            const matchedUserId = await findMatch(userId, myElo, battleType, eloTolerance);

            if (matchedUserId) {
              clearInterval(matchmakingInterval);
              activeQueueIntervals.delete(socket.id);
              stopIntervalForUser(matchedUserId); // Stop opponent's interval too

              const opponent = await User.findById(matchedUserId);

              let problems;
              if (battleType === 'sprint') {
                problems = await Problem.find({ difficulty: 'Easy' });
              } else {
                problems = await Problem.find({});
              }
              if (!problems || problems.length === 0) {
                problems = await Problem.find({});
              }
              if (problems.length === 0) {
                socket.emit('error', { message: 'No coding challenges exist in system.' });
                return;
              }
              const randomProblem = problems[Math.floor(Math.random() * problems.length)];

              const battle = await Battle.create({
                players: [
                  { user: userId, status: 'ready' },
                  { user: matchedUserId, status: 'ready' },
                ],
                problem: randomProblem._id,
                battleType,
                status: 'active',
                startTime: new Date(),
                timeLimit: battleType === 'sprint' ? 300 : 1200,
              });

              const battleIdStr = battle._id.toString();
              console.log(`[Matchmaking] ✅ Battle created: ${battleIdStr} | ${userId} vs ${matchedUserId} | type: ${battleType}`);

              io.to(`user:${userId}`).emit('matchmaking:found', {
                battleId: battleIdStr,
                battleType,
                opponent: {
                  username: opponent?.name || opponent?.email?.split('@')[0] || 'Opponent',
                  elo: opponent?.rank || 1200,
                  level: opponent?.level || 1,
                },
              });

              io.to(`user:${matchedUserId}`).emit('matchmaking:found', {
                battleId: battleIdStr,
                battleType,
                opponent: {
                  username: user.name || user.email.split('@')[0],
                  elo: myElo,
                  level: user.level || 1,
                },
              });

            } else {
              const queueInfo = await getQueuePosition(userId, battleType);
              socket.emit('matchmaking:position', {
                position: queueInfo.position,
                estimatedWait: Math.max(10, 45 - Math.round(eloTolerance / 5)),
                elapsedSeconds,
              });
            }
          }
        } catch (err) {
          console.error('[Matchmaking] Loop error:', err.message);
        }
      }, 2000);

      activeQueueIntervals.set(socket.id, matchmakingInterval);

    } catch (err) {
      console.error('[Matchmaking] join error:', err.message);
      socket.emit('error', { message: 'Failed to enter queue.' });
    }
  });

  // 2. Leave matchmaking queue
  socket.on('matchmaking:leave', async (data) => {
    try {
      const { battleType, topic } = data;

      if (battleType === 'topic') {
        await removeFromTopicQueue(socket.userId, topic);
      } else {
        await removeFromQueue(socket.userId, battleType);
      }

      if (activeQueueIntervals.has(socket.id)) {
        clearInterval(activeQueueIntervals.get(socket.id));
        activeQueueIntervals.delete(socket.id);
      }

      console.log(`[Matchmaking] User ${socket.userId} left ${battleType} queue`);
      socket.emit('matchmaking:left');
    } catch (err) {
      console.error('[Matchmaking] leave error:', err.message);
    }
  });

  // 3. Clean intervals on disconnect
  socket.on('disconnect', () => {
    if (activeQueueIntervals.has(socket.id)) {
      clearInterval(activeQueueIntervals.get(socket.id));
      activeQueueIntervals.delete(socket.id);
    }
    userSocketMap.delete(socket.userId);
    console.log(`[Matchmaking] Cleaned up on disconnect for socket ${socket.id}`);
  });
};
