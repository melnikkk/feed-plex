import type { Interest, RankedArticle, Source } from '@feed-plex/contracts';

export const RELEVANT_ARTICLES_QUEUE_NAME = 'relevant-articles-workflow';

export interface RelevantArticlesJobData {
  sources?: Array<Source>;
  interests?: Array<Interest>;
}

export type RelevantArticlesJobResult = Array<RankedArticle>;
