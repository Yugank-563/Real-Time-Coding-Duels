import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { limiter, errorHandler } from './src/middleware/index.js';

import { 
  authRoutes, battleRoutes, 
  submissionRoutes, userRoutes, 
  problemsRoutes,
  invitationRoutes 
} from './src/routes/index.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Global Rate Limiting
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Backend is Running');
});

// Authentication routes
app.use('/auth', authRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/invitations', invitationRoutes);

// Global 404 handler for unhandled routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found on this server.`,
    timestamp: new Date().toISOString()
  });
});

// 6. Global Error Handler (Runs if any previous route throws an error)
app.use(errorHandler);

export default app;
