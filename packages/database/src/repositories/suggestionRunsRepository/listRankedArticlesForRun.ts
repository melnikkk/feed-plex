import type { RankedArticle } from '@feed-plex/contracts';
import { asc, eq } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { articles, rankedArticleScores } from '../../schema';

export const listRankedArticlesForRun = async (
  db: DbClient,
  runId: string,
): Promise<Array<RankedArticle>> => {
  const rows = await db
    .select({
      score: rankedArticleScores.score,
      semanticSimilarity: rankedArticleScores.semanticSimilarity,
      lexicalScore: rankedArticleScores.lexicalScore,
      freshnessScore: rankedArticleScores.freshnessScore,
      sourceAffinity: rankedArticleScores.sourceAffinity,
      noveltyPenalty: rankedArticleScores.noveltyPenalty,
      diversityAdjustment: rankedArticleScores.diversityAdjustment,
      title: articles.title,
      link: articles.link,
      summary: articles.summary,
      publishedAt: articles.publishedAt,
      sourceUrl: articles.sourceUrl,
    })
    .from(rankedArticleScores)
    .innerJoin(articles, eq(rankedArticleScores.articleId, articles.id))
    .where(eq(rankedArticleScores.suggestionRunId, runId))
    .orderBy(asc(rankedArticleScores.rank));

  return rows.map((row) => ({
    article: {
      title: row.title,
      link: row.link,
      summary: row.summary,
      publishedAt: row.publishedAt.toISOString(),
      sourceUrl: row.sourceUrl,
    },
    score: row.score,
    breakdown: {
      semanticSimilarity: row.semanticSimilarity,
      lexicalScore: row.lexicalScore,
      freshnessScore: row.freshnessScore,
      sourceAffinity: row.sourceAffinity,
      noveltyPenalty: row.noveltyPenalty,
      diversityAdjustment: row.diversityAdjustment,
    },
  }));
};
