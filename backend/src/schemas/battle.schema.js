import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

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
