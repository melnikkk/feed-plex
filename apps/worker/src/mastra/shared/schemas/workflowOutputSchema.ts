import { rankedArticleSchema } from '@feed-plex/contracts';
import { z } from 'zod';

export const workflowOutputSchema = z.object({
  rankedArticles: z.array(rankedArticleSchema),
});
