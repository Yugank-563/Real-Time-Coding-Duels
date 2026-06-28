import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// Handlers imports
import { registerMatchmakingHandlers } from './handlers/matchmaking.js';
import { registerBattleHandlers } from './handlers/battle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load central environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../../backend/src/config/db.js';

const PORT = process.env.SOCKET_PORT || 5001;
const mongoUri = process.env.MONGO_URI;
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

if (!mongoUri) {
  console.error('MONGO_URI is missing!');
  process.exit(1);
}

// 1. Connect to MongoDB using Backend Mongoose instance to avoid buffering timeouts
await connectDB()
  .then(() => console.log('Socket Service connected to MongoDB (Backend Instance)'))
  .catch((err) => {
    console.error('Socket Service MongoDB failed:', err.message);
    process.exit(1);
  });

const redisOptions = {};
if (redisUrl.startsWith('rediss://')) {
  redisOptions.socket = {
    tls: true,
    rejectUnauthorized: false,
  };
}

const pubClient = createClient({ url: redisUrl, ...redisOptions });
const adapterSubClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Socket Redis Pub Client Error:', err.message));
adapterSubClient.on('error', (err) => console.error('Socket Redis Adapter Sub Client Error:', err.message));

await Promise.all([pubClient.connect(), adapterSubClient.connect()]);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  adapter: createAdapter(pubClient, adapterSubClient)
});

// 2. Setup Redis Pub/Sub listener for microservice communication (Manual events)
const subClient = createClient({ url: redisUrl, ...redisOptions });
subClient.on('error', (err) => console.error('Socket Redis Sub Client Error:', err.message));
await subClient.connect();

// Listen for compiler updates and emit to socket clients
await subClient.subscribe('battle:events', (message) => {
  try {
    const { battleId, event, data } = JSON.parse(message);
    console.log(`Redis Pub/Sub received [${event}] for battle ${battleId}`);

    // Broadcast message to Socket room corresponding to battleId
    io.to(`battle:${battleId}`).emit(event, data);
  } catch (error) {
    console.error('Error handling Redis Pub/Sub message:', error.message);
  }
});

await subClient.subscribe('submission:events', (message) => {
  try {
    const data = JSON.parse(message);
    const { submissionId, userId, battleId, type } = data;

    if (type === 'progress') {
      // Chunk terminal logging to prevent log spam for massive datasets
      if (data.done === 1 || data.done === data.total || data.done % 20 === 0) {
        console.log(`Redis Pub/Sub received submission progress for ${submissionId}: ${data.done}/${data.total}`);
      }
      io.to(`user:${userId}`).emit('submission:progress', {
        submissionId,
        done: data.done,
        total: data.total,
      });
      return;
    }

    const { verdict, testCasesPassed, totalTestCases, results, isSubmit } = data;
    console.log(`Redis Pub/Sub received submission result for ${submissionId} (isSubmit: ${isSubmit})`);

    // Send feedback directly to user socket
    io.to(`user:${userId}`).emit('submission:result', {
      submissionId,
      verdict,
      testCasesPassed,
      totalTestCases,
      results,
    });

    if (battleId) {
      io.to(`battle:${battleId}`).emit('battle:submission_result', {
        userId,
        verdict,
        testCasesPassed,
        totalTestCases,
      });
    }

    // Trigger AI Analysis in background (Only for fully Accepted submissions as requested)
    if ((verdict === 'Accepted' || verdict === 'AC') && isSubmit) {
      // Use Redis Pub/Sub to trigger AI Analysis (Decoupled architecture)
      pubClient.publish('trigger_ai_analysis', submissionId).catch(err => {
        console.error('Failed to trigger AI Analysis via Redis', err);
      });
    }
  } catch (error) {
    console.error('Error handling Redis Pub/Sub submission message:', error.message);
  }
});

// Listen for AI analysis completion
await subClient.subscribe('ai:analysis_ready', (message) => {
  try {
    const data = JSON.parse(message);
    const { submissionId, userId, aiAnalysis } = data;
    console.log(`Redis Pub/Sub received AI analysis for submission ${submissionId}`);
    
    io.to(`user:${userId}`).emit('ai:analysis_ready', {
      submissionId,
      aiAnalysis
    });
  } catch (error) {
    console.error('Error handling Redis Pub/Sub ai:analysis_ready message:', error.message);
  }
});

// 3. Authenticate socket connections using JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || token === 'undefined' || token === 'null') {
      return next(new Error('Authentication failed: Missing token.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, role }
    socket.userId = decoded.id;
    next();
  } catch (err) {
    // Only log genuinely unexpected errors — not standard token client issues
    if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
      console.error('Socket Auth Unexpected Error:', err.message);
    } else {
      console.warn(`Socket Auth Failed (${err.name}): ${err.message}`);
    }
    return next(new Error('Authentication failed: Invalid token.'));
  }
});

// 4. Map namespace connection flows
io.on('connection', (socket) => {
  console.log(`Socket client connected: socket=${socket.id}, user=${socket.userId}`);

  // Join self-user channel for targeted events
  socket.join(`user:${socket.userId}`);

  // Register feature handlers
  registerMatchmakingHandlers(io, socket);
  registerBattleHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Gateway is listening on port ${PORT}`);
});
