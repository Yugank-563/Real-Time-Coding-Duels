import jwt from 'jsonwebtoken';

const throwAuthError = (message, next) => {
  const err = new Error(message);
  err.status = 401;
  return next(err);
};

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return throwAuthError('Authentication required. Bearer token missing.', next);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user metadata on request
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    // Only log unexpected errors — not malformed/missing tokens (client-side issues)
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      console.error('JWT Verification Error:', error.message);
    }
    return throwAuthError('Invalid or expired authentication token.', next);
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Proceed without auth
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Set user metadata on request if token is valid
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (error) {
    // If token is invalid/expired, still proceed as guest
    next();
  }
};
