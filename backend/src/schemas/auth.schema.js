import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
    password: z.string({ required_error: 'Password is required' }).max(128, 'Password too long'),
  }).strict(),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 characters').regex(/^\d{6}$/, 'OTP must contain only numbers'),
  }).strict(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
  }).strict(),
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
  }).strict(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 characters').regex(/^\d{6}$/, 'OTP must contain only numbers'),
    newPassword: z.string({ required_error: 'New password is required' }).min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
  }).strict(),
});

export const verifyResetOTPSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').max(100, 'Email too long'),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 characters').regex(/^\d{6}$/, 'OTP must contain only numbers'),
  }).strict(),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }).strict(),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }).strict(),
});
