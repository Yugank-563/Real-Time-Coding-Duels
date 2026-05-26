import express from 'express';
import {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe
} from '../controllers/auth/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

export default router;
