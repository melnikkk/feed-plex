import { Article } from "../../../shared/schemas/articleSchema";

const toTimestamp = (publishedAt: string): number => {
  const ms = Date.parse(publishedAt);

  return Number.isNaN(ms) ? 0 : ms;
};

export const takeMostRecentArticles = (
  articles: Array<Article>,
  maxCount: number,
): Array<Article> =>
  [...articles]
    .sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt))
    .slice(0, maxCount);
