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
} from '../controllers/index.js';
import { authMiddleware, authLimiter, validateRequest } from '../middleware/index.js';
import {
  registerSchema,
  verifyOTPSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetOTPSchema,
  refreshTokenSchema,
  logoutSchema
} from '../schemas/index.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/verify-otp', authLimiter, validateRequest(verifyOTPSchema), verifyOTP);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshTokenSchema), refreshToken);
router.post('/logout', validateRequest(logoutSchema), logout);

// Password reset routes
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', authLimiter, validateRequest(verifyResetOTPSchema), verifyResetOTP);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);

export default router;
