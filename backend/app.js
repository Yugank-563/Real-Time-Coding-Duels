import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { limiter } from './src/middleware/rateLimiter.js';

import authRoutes from './src/routes/auth.routes.js';
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

// Global Rate Limiting
app.use(limiter);

app.get('/', (req, res) => {
  res.send('BattleCode Backend Running');
});

// Authentication routes
app.use('/auth', authRoutes);

app.all('/{*any}', (req, res) => {
  res.status(404).send('Page Not Found');
});


export default app;
