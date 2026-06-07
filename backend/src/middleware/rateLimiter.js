import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

export const executionLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 3, // Limit each IP to 3 requests per 15 seconds
  message: { message: 'Execution rate limit exceeded. Please wait a few seconds before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
