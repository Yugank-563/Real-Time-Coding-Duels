import { 
  addToQueue, 
  removeFromQueue, 
  findMatch, 
  getQueuePosition,
  handleTopicQueue,
  findTopicMatch,
  removeFromTopicQueue,
  getRandomProblem
} from '../../../backend/src/services/index.js';
import { 
  findUserById,
  createBattle,
  findOneAndUpdateProblem
} from '../../../backend/src/repositories/index.js';
import { matchmakingSchema } from '../schemas/socket.schema.js';
import { validateSocketPayload } from '../utils/validation.js';

const eloToDifficulty = (elo) => {
  if (elo <= 1300) return 'EASY';
  if (elo <= 1600) return 'MEDIUM';
  return 'HARD';
};

// Cache active intervals keyed by socket.id to prevent leaks
const activeQueueIntervals = new Map();

// Map userId → socketId so we can stop the matched user's interval
const userSocketMap = new Map();

const executeMatchCreation = async (userId, matchedUserId, myElo, topic, battleType, user, opponent, io, mode = 'ranked') => {
  let dbProblem;
  try {
    let problemData;
    let difficulty = 'MEDIUM';

    if (battleType === 'topic') {
      difficulty = eloToDifficulty(Math.round((myElo + (opponent?.rating || 1200)) / 2));
      problemData = await getRandomProblem(topic, difficulty);
    } else if (battleType === 'sprint') {
      difficulty = 'EASY';
      problemData = await getRandomProblem('Array', 'EASY');
    } else {
      difficulty = eloToDifficulty(Math.round((myElo + (opponent?.rating || 1200)) / 2));
      problemData = await getRandomProblem('Array', difficulty);
    }

    const dbDiff = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
    const query = problemData.titleSlug ? { titleSlug: problemData.titleSlug } : { title: problemData.title };
    dbProblem = await findOneAndUpdateProblem(
      query,
      { 
        ...problemData,
        description: problemData.content || problemData.description || '',
        difficulty: dbDiff,
        boilerplates: (problemData.boilerplates && problemData.boilerplates.cpp)
          ? problemData.boilerplates
          : { cpp: `class Solution {\npublic:\n    // Write your code here\n};` }
      },
      { upsert: true, new: true }
    );
  } catch (fetchErr) {
    io.to(`user:${userId}`).emit('battle:problem_error', { message: 'Problem fetch failed. Requeuing...' });
    io.to(`user:${matchedUserId}`).emit('battle:problem_error', { message: 'Problem fetch failed. Requeuing...' });
    
    if (battleType === 'topic-duel') {
      await handleTopicQueue(userId, myElo, topic, mode);
      if (opponent) await handleTopicQueue(matchedUserId, opponent.rating || 1200, topic, mode);
    } else {
      await addToQueue(userId, myElo, battleType, mode);
      if (opponent) await addToQueue(matchedUserId, opponent.rating || 1200, battleType, mode);
    }
    return;
  }

  const battleData = {
    players: [
      { user: userId, status: 'ready' },
      { user: matchedUserId, status: 'ready' },
    ],
    problem: dbProblem._id,
    battleType,
    mode,
    status: 'active',
    startTime: new Date(),
    timeLimit: battleType === 'timed-sprint' ? 600 : 1200,
  };
  
  if (battleType === 'topic-duel' && topic) {
    battleData.topic = topic;
  }

  const battle = await createBattle(battleData);
  const battleIdStr = battle._id.toString();
  const myData = {
    battleId: battleIdStr,
    battleType,
    mode,
    opponent: {
      username: opponent?.name || opponent?.email?.split('@')[0] || 'Opponent',
      elo: opponent?.rating || 1200,
    },
  };
  
  const opponentData = {
    battleId: battleIdStr,
    battleType,
    mode,
    opponent: {
      username: user.name || user.email.split('@')[0],
      elo: myElo,
    },
  };

  if (battleType === 'topic-duel' && topic) {
    myData.topic = topic;
    opponentData.topic = topic;
  }

  io.to(`user:${userId}`).emit('matchmaking:found', myData);
  io.to(`user:${matchedUserId}`).emit('matchmaking:found', opponentData);
};

export const registerMatchmakingHandlers = (io, socket) => {

  // Track socket for this user (update on each connection)
  userSocketMap.set(socket.userId, socket.id);

  // Stops the user's matchmaking loop if they get matched by someone else
  const stopIntervalForUser = (userId) => {
    const targetSocketId = userSocketMap.get(userId);
    if (targetSocketId && activeQueueIntervals.has(targetSocketId)) {
      clearInterval(activeQueueIntervals.get(targetSocketId));
      activeQueueIntervals.delete(targetSocketId);
    }
  };

  // 1. Join matchmaking queue
  socket.on('matchmaking:join', async (raw_data) => {
    try {
      const data = validateSocketPayload(matchmakingSchema, raw_data, socket, 'matchmaking:join');
      if (!data) return;

      const { battleType, topic, mode = 'ranked' } = data;
      const userId = socket.userId;

      const user = await findUserById(userId);
      if (!user) {
        socket.emit('error', { message: 'User profile not found.' });
        return;
      }

      const myElo = user.rating || 1200;

      // Track current queue info on the socket for disconnect cleanup
      socket.currentQueueData = { battleType, topic, mode };

      // Add to Redis queue
      if (battleType === 'topic-duel') {
        if (!topic) {
          socket.emit('error', { message: 'Topic is required for topic battles.' });
          return;
        }
        await handleTopicQueue(userId, myElo, topic, mode);

      } else {
        await addToQueue(userId, myElo, battleType, mode);
      }

      // Clear any pre-existing interval for this socket (re-join case)
      if (activeQueueIntervals.has(socket.id)) {
        clearInterval(activeQueueIntervals.get(socket.id));
        activeQueueIntervals.delete(socket.id);
      }

      let elapsedSeconds = 0;
      let eloTolerance = (battleType === 'topic-duel') ? 150 : 100;

      // Start periodic pairing loop (every 2 seconds)
      const matchmakingInterval = setInterval(async () => {
        try {
          elapsedSeconds += 2;

          // Progressively expand Elo search range
          const expandEvery = 20;
          if (elapsedSeconds % expandEvery === 0) {
            eloTolerance += 50;

          }
          if (elapsedSeconds >= 50) {
            clearInterval(matchmakingInterval);
            activeQueueIntervals.delete(socket.id);
            delete socket.currentQueueData;

            if (battleType === 'topic-duel') {
              await removeFromTopicQueue(userId, topic, mode);
            } else {
              await removeFromQueue(userId, battleType, mode);
            }
            
            socket.emit('matchmaking:timeout', { message: 'No user found with your criteria. Please try again later.' });
            return;
          }

          if (battleType === 'topic-duel') {
            // ── TOPIC MATCHMAKING ──
            const matchedUserId = await findTopicMatch(userId, myElo, topic, mode, eloTolerance);

            if (matchedUserId) {
              clearInterval(matchmakingInterval);
              activeQueueIntervals.delete(socket.id);
              delete socket.currentQueueData;
              stopIntervalForUser(matchedUserId); // Stop opponent's interval too

              const opponent = await findUserById(matchedUserId);
              await executeMatchCreation(userId, matchedUserId, myElo, topic, 'topic-duel', user, opponent, io, mode);

            } else {
                socket.emit('matchmaking:position', {
                  position: 1,
                  estimatedWait: Math.max(10, 60 - elapsedSeconds),
                  elapsedSeconds,
                });
            }

          } else {
            // ── STANDARD MATCHMAKING (1v1, sprint, etc.) ──
            const matchedUserId = await findMatch(userId, myElo, battleType, mode, eloTolerance);

            if (matchedUserId) {
              clearInterval(matchmakingInterval);
              activeQueueIntervals.delete(socket.id);
              delete socket.currentQueueData;
              stopIntervalForUser(matchedUserId); // Stop opponent's interval too

              const opponent = await findUserById(matchedUserId);
              await executeMatchCreation(userId, matchedUserId, myElo, null, battleType, user, opponent, io, mode);

            } else {
              const queueInfo = await getQueuePosition(userId, battleType, mode);
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
      socket.emit('error', { message: 'Failed to enter queue.' });
    }
  });

  // 2. Leave matchmaking queue
  socket.on('matchmaking:leave', async (raw_data) => {
    try {
      const data = validateSocketPayload(matchmakingSchema, raw_data, socket, 'matchmaking:leave');
      if (!data) return;

      const { battleType, topic, mode = 'ranked' } = data;

      if (battleType === 'topic-duel') {
        await removeFromTopicQueue(socket.userId, topic, mode);
      } else {
        await removeFromQueue(socket.userId, battleType, mode);
      }

      if (activeQueueIntervals.has(socket.id)) {
        clearInterval(activeQueueIntervals.get(socket.id));
        activeQueueIntervals.delete(socket.id);
      }
      
      delete socket.currentQueueData;


      socket.emit('matchmaking:left');
    } catch (err) {
      console.error('[Matchmaking] leave error:', err.message);
    }
  });

  // 3. Clean intervals and Redis queues on disconnect
  socket.on('disconnect', async () => {
    if (activeQueueIntervals.has(socket.id)) {
      clearInterval(activeQueueIntervals.get(socket.id));
      activeQueueIntervals.delete(socket.id);
    }
    
    // Efficiently remove user from the matchmaking queue they were in
    if (socket.currentQueueData && socket.userId) {
      const { battleType, topic, mode } = socket.currentQueueData;
      try {
        if (battleType === 'topic-duel') {
          await removeFromTopicQueue(socket.userId, topic, mode);
        } else {
          await removeFromQueue(socket.userId, battleType, mode);
        }
      } catch (err) {
        console.error('[Matchmaking] Disconnect queue cleanup error:', err.message);
      }
    }
    
    userSocketMap.delete(socket.userId);
    console.log(`[Matchmaking] Cleaned up on disconnect for socket ${socket.id}`);
  });
};
