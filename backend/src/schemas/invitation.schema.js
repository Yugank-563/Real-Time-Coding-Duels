import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const sendInvitationSchema = z.object({
  body: z.object({
    recipientId: z.string({ required_error: 'Recipient is required' }).min(1),
    battleMode: z.string().optional().default('1v1'),

    metadata: z.record(z.any()).optional(),
  }).strict(),
});

export const invitationActionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdPattern, 'Invalid Invitation ID format'),
  }),
});
