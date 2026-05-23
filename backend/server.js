import './src/config/env.js';
import app from './app.js';
import { connectDB } from './src/config/db.js';

// Connect to Database
await connectDB();

const PORT = process.env.BACKEND_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

// Handle standard exit signals for clean port releasing
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.once('SIGUSR2', gracefulShutdown);
