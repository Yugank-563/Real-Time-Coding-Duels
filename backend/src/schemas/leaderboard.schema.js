import { z } from 'zod';

export const getLeaderboardSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    search: z.string().max(100, 'Search query too long').optional(),
    country: z.string().max(100, 'Country query too long').optional(),
    sort: z.enum(['rank', 'wins', 'winRate', 'battlesPlayed']).optional().default('rank'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }).passthrough(),
});
