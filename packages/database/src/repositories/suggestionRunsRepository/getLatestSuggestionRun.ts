import type { RankedArticle } from '@feed-plex/contracts';
import { and, desc, eq } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { suggestionRuns } from '../../schema';
import { listRankedArticlesForRun } from './listRankedArticlesForRun';

export interface LatestSuggestionRun {
  runId: string;
  completedAt: string;
  articles: Array<RankedArticle>;
}

export const getLatestSuggestionRun = async (
  db: DbClient,
  feedId: string,
): Promise<LatestSuggestionRun | null> => {
  const run = await db.query.suggestionRuns.findFirst({
    where: and(eq(suggestionRuns.feedId, feedId), eq(suggestionRuns.status, 'completed')),
    orderBy: desc(suggestionRuns.createdAt),
  });

  if (!run) {
    return null;
  }

  return {
    runId: run.id,
    completedAt: run.completedAt.toISOString(),
    articles: await listRankedArticlesForRun(db, run.id),
  };
};
