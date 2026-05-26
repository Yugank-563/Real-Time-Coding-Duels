import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Bearer token missing.' });
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
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};
