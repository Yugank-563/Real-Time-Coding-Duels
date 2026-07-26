import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

// Handlers imports
import { registerMatchmakingHandlers } from './handlers/matchmaking.js';
import { registerBattleHandlers } from './handlers/battle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
if (fs.existsSync(path.resolve(__dirname, '../../.env'))) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

import { connectDB } from './config/db.js';

const PORT = process.env.SOCKET_PORT;
const mongoUri = process.env.MONGO_URI;
const redisUrl = process.env.REDIS_URL;

if (!mongoUri) {
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
    origin: process.env.FRONTEND_URL,
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
      io.to(`user:${userId}`).emit('submission:progress', {
        submissionId,
        done: data.done,
        total: data.total,
      });
      return;
    }

    const { verdict, testCasesPassed, totalTestCases, results, isSubmit } = data;
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
  } catch (error) {
    console.error('Error handling Redis Pub/Sub submission message:', error.message);
  }
});

// Listen for invitation events
await subClient.subscribe('invitation:events', (message) => {
  try {
    const { userId, event, data } = JSON.parse(message);
    io.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    console.error('Error handling Redis Pub/Sub invitation message:', error.message);
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
    socket.user = decoded; // { id }
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication failed: Invalid token.'));
  }
});

// 4. Map namespace connection flows
io.on('connection', (socket) => {
  // Join self-user channel for targeted events
  socket.join(`user:${socket.userId}`);

  // Register feature handlers
  registerMatchmakingHandlers(io, socket);
  registerBattleHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Gateway is listening on port ${PORT}`);
});
