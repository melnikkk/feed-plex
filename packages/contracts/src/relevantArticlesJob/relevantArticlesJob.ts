import { z } from 'zod';
import { rankedArticleSchema } from '../article';

export const RELEVANT_ARTICLES_QUEUE_NAME = 'relevant-articles-workflow';

export const RELEVANT_ARTICLES_JOB_NAME = 'run';

export const RELEVANT_ARTICLES_JOB_RETENTION_SECONDS = 60 * 60;

export const REFRESH_SWEEP_QUEUE_NAME = 'feed-refresh-sweep';

export const relevantArticlesJobDataSchema = z.object({
  feedId: z.uuid(),
});

export type RelevantArticlesJobData = z.infer<typeof relevantArticlesJobDataSchema>;

export const relevantArticlesJobResultSchema = z.array(rankedArticleSchema);

export type RelevantArticlesJobResult = z.infer<typeof relevantArticlesJobResultSchema>;
