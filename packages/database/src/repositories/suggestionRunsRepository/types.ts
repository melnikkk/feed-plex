import type { Interest, RankedArticle, Source } from '@feed-plex/contracts';

export interface SaveSuggestionRunInput {
  jobId: string;
  feedId: string;
  sources: Array<Source>;
  interests: Array<Interest>;
  rankedArticles: Array<RankedArticle>;
}
