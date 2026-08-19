import type { RankedArticle } from '@/mastra/shared/schemas/rankedArticleSchema';
import type { Interest } from '@/schemas/interestSchema';
import type { Source } from '@/schemas/sourceSchema';

export const RELEVANT_ARTICLES_QUEUE_NAME = 'relevant-articles-workflow';

export interface RelevantArticlesJobData {
  sources?: Source[];
  interests?: Interest[];
}

export type RelevantArticlesJobResult = RankedArticle[];
