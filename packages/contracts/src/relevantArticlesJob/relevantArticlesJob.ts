import { z } from 'zod';
import { rankedArticleSchema } from '../article';

export const RELEVANT_ARTICLES_QUEUE_NAME = 'relevant-articles-workflow';

export const relevantArticlesJobDataSchema = z.object({
  feedId: z.uuid(),
});

export type RelevantArticlesJobData = z.infer<typeof relevantArticlesJobDataSchema>;

export const relevantArticlesJobResultSchema = z.array(rankedArticleSchema);

export type RelevantArticlesJobResult = z.infer<typeof relevantArticlesJobResultSchema>;
