import type { RankedArticle } from '@feed-plex/contracts';

export const RELEVANT_ARTICLES_QUEUE_NAME = 'relevant-articles-workflow';

export interface RelevantArticlesJobData {
  feedId: string;
}

export type RelevantArticlesJobResult = Array<RankedArticle>;
