import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const sendInvitationSchema = z.object({
  body: z.object({
    recipientId: z.string({ required_error: 'Recipient is required' }).min(1, 'Recipient username is required'),
    battleMode: z.string().refine((val) => ['random-duel', 'timed-sprint', 'topic-duel'].includes(val), {
      message: 'Invalid battle mode',
    }).default('random-duel'),
    metadata: z.object({
      difficulty: z.string().refine((val) => ['Easy', 'Medium', 'Hard'].includes(val), {
        message: 'Difficulty is required'
      }).optional(),
      timeLimit: z.number().positive('Time limit must be a positive number').optional(),
      topic: z.string().optional(),
    }).optional(),
  }).strict().refine((data) => {
    if (data.battleMode === 'topic-duel' && (!data.metadata || !data.metadata.topic)) {
      return false;
    }
    return true;
  }, {
    message: "Topic is required",
    path: ["metadata", "topic"],
  }),
});

export const invitationActionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdPattern, 'Invalid Invitation ID format'),
  }),
});
