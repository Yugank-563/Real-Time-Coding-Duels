import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const joinPrivateRoomSchema = z.object({
  body: z.object({
    roomCode: z.string().min(1, 'Room code is required'),
    password: z.string().max(128, 'Password too long').optional().default(''),
  }).strict(),
});

export const createPrivateRoomSchema = z.object({
  body: z.object({
    name: z.string().max(50, 'Room name too long').optional().default(''),
    password: z.string().max(128, 'Password too long').optional().default(''),
    timeLimit: z.number().min(60).max(7200).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'any']).optional(),
  }).strict(),
});

export const battleActionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdPattern, 'Invalid Battle ID format'),
  }),
});

export const joinQueueSchema = z.object({
  body: z.object({
    battleType: z.string({ required_error: 'battleType is required' }).min(1),
    topic: z.string().optional(),
    teamId: z.string().optional(),
  }).strict(),
});

export const leaveQueueSchema = z.object({
  body: z.object({
    battleType: z.string({ required_error: 'battleType is required' }).min(1),
  }).strict(),
});

export const getQueueStatusSchema = z.object({
  query: z.object({
    battleType: z.string({ required_error: 'battleType is required' }).min(1),
  }).strict(),
});
