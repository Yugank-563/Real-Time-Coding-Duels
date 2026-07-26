import http from 'http';
import './env.js'; // Loads env vars first before worker/DB imports
import { connectDB } from '../../backend/src/config/db.js';
import './worker.js'; // Starts the BullMQ worker

const PORT = process.env.PORT || 10002;

// Lightweight HTTP server for Render health checks and port binding
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Compiler Service Worker is active\n');
});

server.listen(PORT, () => {
  console.log(`Compiler Service running on port ${PORT}`);
});

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not defined in environment!');
  process.exit(1);
}

// Connect to MongoDB Database using Backend Mongoose instance to avoid buffering timeouts
await connectDB()
  .then(() => console.log('Compiler Service successfully connected to MongoDB (Backend Instance)'))
  .catch((err) => {
    console.error('Compiler Service MongoDB connection failed:', err.message);
    process.exit(1);
  });
