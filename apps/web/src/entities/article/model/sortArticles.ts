import type { RankedArticle } from '@feed-plex/contracts';

export type ArticleSortOption = 'relevance' | 'newest';

const comparators: Record<ArticleSortOption, (a: RankedArticle, b: RankedArticle) => number> = {
  relevance: (a, b) => b.score - a.score,
  newest: (a, b) => Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt),
};

export const isArticleSortOption = (value: unknown): value is ArticleSortOption =>
  typeof value === 'string' && value in comparators;

export const sortArticles = (
  articles: Array<RankedArticle>,
  option: ArticleSortOption,
): Array<RankedArticle> => articles.toSorted(comparators[option]);
