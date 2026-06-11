import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const battleSocketSchema = z.object({
  battleId: z.string().regex(objectIdPattern, 'Invalid Battle ID format'),
}).passthrough();

export const codeChangeSocketSchema = battleSocketSchema.extend({
  language: z.enum(['cpp']).optional(),
}).passthrough();

export const matchmakingSchema = z.object({
  battleType: z.enum(['sprint', '1v1', 'team', 'topic']),
  topic: z.string().max(50).optional(),
}).passthrough();
