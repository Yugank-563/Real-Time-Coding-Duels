import { z } from 'zod';

export const runCodeSchema = z.object({
  params: z.object({
    slug: z.string().max(100, 'Invalid slug format'),
  }),
  body: z.object({
    code: z.string().max(65536, 'Code exceeds maximum allowed length of 64KB'),
    language: z.enum(['cpp']),
    customInputs: z.array(z.string().max(1024, 'Input too large')).max(10, 'Too many custom inputs').optional().default([]),
  }).strict(),
});

export const submitCodeSchema = z.object({
  params: z.object({
    slug: z.string().max(100, 'Invalid slug format'),
  }),
  body: z.object({
    code: z.string().max(65536, 'Code exceeds maximum allowed length of 64KB'),
    language: z.enum(['cpp']),
  }).strict(),
});

export const getProblemsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    search: z.string().max(100, 'Search query too long').optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'ALL']).optional(),
    tag: z.string().max(50).optional(),
  }).passthrough(),
});

export const slugSchema = z.object({
  params: z.object({
    slug: z.string().max(100, 'Invalid slug format'),
  }),
});
