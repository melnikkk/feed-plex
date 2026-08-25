import { z } from 'zod';
import { rankedArticleSchema } from './rankedArticleSchema';

export const feedArticlesResponseSchema = z.object({
  runId: z.string().nullable(),
  completedAt: z.string().nullable(),
  articles: z.array(rankedArticleSchema),
});

export type FeedArticlesResponse = z.infer<typeof feedArticlesResponseSchema>;
