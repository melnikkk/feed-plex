import { Article } from '../../../shared/schemas/articleSchema';

export const dedupeArticlesBySourceAffinity = (
  articles: Array<Article>,
  sourceAffinityByUrl: Map<string, number>,
): Array<Article> => {
  const bestByLink = new Map<string, Article>();

  for (const article of articles) {
    const existing = bestByLink.get(article.link);

    if (!existing) {
      bestByLink.set(article.link, article);

      continue;
    }

    const candidateAffinity = sourceAffinityByUrl.get(article.sourceUrl) ?? 0;
    const existingAffinity = sourceAffinityByUrl.get(existing.sourceUrl) ?? 0;

    if (candidateAffinity > existingAffinity) {
      bestByLink.set(article.link, article);
    }
  }

  return [...bestByLink.values()];
};
