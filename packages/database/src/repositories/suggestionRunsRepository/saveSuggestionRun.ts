import { eq, sql } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { articles, interests, rankedArticleScores, sources, suggestionRuns } from '../../schema';
import type { SaveSuggestionRunInput } from './types';

export const saveSuggestionRun = async (
  db: DbClient,
  {
    jobId,
    feedId,
    sources: jobSources,
    interests: jobInterests,
    rankedArticles,
  }: SaveSuggestionRunInput,
): Promise<void> => {
  await db.transaction(async (tx) => {
    if (jobSources.length > 0) {
      await tx
        .insert(sources)
        .values(
          jobSources.map((source) => ({
            feedId,
            url: source.url,
            sourceAffinity: source.sourceAffinity,
          })),
        )
        .onConflictDoUpdate({
          target: [sources.feedId, sources.url],
          set: { sourceAffinity: sql`excluded.source_affinity` },
        });
    }

    if (jobInterests.length > 0) {
      await tx
        .insert(interests)
        .values(
          jobInterests.map((interest) => ({
            feedId,
            topic: interest.topic,
            weight: interest.weight,
            keywords: interest.keywords,
            embedding: interest.embedding,
          })),
        )
        .onConflictDoUpdate({
          target: [interests.feedId, interests.topic],
          set: {
            weight: sql`excluded.weight`,
            keywords: sql`excluded.keywords`,
            embedding: sql`excluded.embedding`,
          },
        });
    }

    // BullMQ job ids restart at 1 whenever Redis loses its state, so an id can collide with an
    // older run: overwrite every column and drop the previous scores instead of merging into them.
    await tx
      .insert(suggestionRuns)
      .values({ id: jobId, feedId, status: 'completed' })
      .onConflictDoUpdate({
        target: suggestionRuns.id,
        set: {
          feedId: sql`excluded.feed_id`,
          status: sql`excluded.status`,
          createdAt: sql`now()`,
          completedAt: sql`now()`,
        },
      });

    await tx.delete(rankedArticleScores).where(eq(rankedArticleScores.suggestionRunId, jobId));

    if (rankedArticles.length === 0) {
      return;
    }

    const uniqueArticlesByLink = new Map(
      rankedArticles.map(({ article }) => [article.link, article]),
    );

    const savedArticles = await tx
      .insert(articles)
      .values(
        Array.from(uniqueArticlesByLink.values()).map((article) => ({
          link: article.link,
          title: article.title,
          summary: article.summary,
          publishedAt: new Date(article.publishedAt),
          sourceUrl: article.sourceUrl,
        })),
      )
      .onConflictDoUpdate({
        target: articles.link,
        set: {
          title: sql`excluded.title`,
          summary: sql`excluded.summary`,
          publishedAt: sql`excluded.published_at`,
          sourceUrl: sql`excluded.source_url`,
        },
      })
      .returning({ id: articles.id, link: articles.link });

    const articleIdByLink = new Map(savedArticles.map(({ id, link }) => [link, id]));

    await tx.insert(rankedArticleScores).values(
      rankedArticles.map(({ article, score, breakdown }, index) => {
        const articleId = articleIdByLink.get(article.link);

        if (!articleId) {
          throw new Error(`Missing persisted article id for link: ${article.link}`);
        }

        return {
          suggestionRunId: jobId,
          articleId,
          rank: index,
          score,
          semanticSimilarity: breakdown.semanticSimilarity,
          lexicalScore: breakdown.lexicalScore,
          freshnessScore: breakdown.freshnessScore,
          sourceAffinity: breakdown.sourceAffinity,
          noveltyPenalty: breakdown.noveltyPenalty,
          diversityAdjustment: breakdown.diversityAdjustment,
        };
      }),
    );
  });
};
