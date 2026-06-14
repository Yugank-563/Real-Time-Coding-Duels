import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().regex(/^[a-zA-Z0-9_]{3,25}$/, 'Username must be 3-25 characters (letters, numbers, underscores)').optional(),
    name: z.string().max(50, 'Name must be at most 50 characters').optional(),
    bio: z.string().max(250, 'Bio must be at most 250 characters').optional(),
    country: z.string().max(100, 'Country must be at most 100 characters').optional(),
  }).strict(), // Strict prevents mass assignment of fields like role, rank, etc.
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().max(100, 'Search query too long').optional().default(''),
  }).passthrough(),
});
