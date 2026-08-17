import { Article } from "../../../shared/schemas/articleSchema";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const filterArticlesByMaxAge = (
  articles: Array<Article>,
  maxAgeDays: number,
  now: Date = new Date(),
): Array<Article> =>
  articles.filter((article) => {
    const publishedAtMs = Date.parse(article.publishedAt);

    if (Number.isNaN(publishedAtMs)) {
      return true;
    }

    const ageInDays = (now.getTime() - publishedAtMs) / MS_PER_DAY;

    return ageInDays <= maxAgeDays;
  });
