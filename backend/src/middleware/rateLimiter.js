import rateLimit from 'express-rate-limit';

const createRateLimitHandler = (message) => {
  return (_req, _res, next) => {
    const err = new Error(message);
    err.status = 429;
    next(err);
  };
};

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  handler: createRateLimitHandler('Too many requests from this IP, please try again after 15 minutes'),
});

export const executionLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 3, // Limit each IP to 3 requests per 15 seconds
  handler: createRateLimitHandler('Execution rate limit exceeded. Please wait a few seconds before trying again.'),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  handler: createRateLimitHandler('Too many authentication attempts from this IP, please try again after 15 minutes'),
});
