import { z } from 'zod';
import { rankedArticleSchema } from './rankedArticleSchema';

export const workflowOutputSchema = z.object({
  rankedArticles: z.array(rankedArticleSchema),
});
