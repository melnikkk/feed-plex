import type { RankedArticle } from '@feed-plex/contracts';

export const ALL_SOURCES = 'all';

export const filterArticlesBySource = (
  articles: Array<RankedArticle>,
  sourceUrl: string,
): Array<RankedArticle> => {
  if (sourceUrl === ALL_SOURCES) {
    return articles;
  }

  return articles.filter((ranked) => ranked.article.sourceUrl === sourceUrl);
};
