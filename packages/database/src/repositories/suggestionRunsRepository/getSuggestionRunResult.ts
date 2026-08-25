import type { RankedArticle } from '@feed-plex/contracts';
import { eq } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { suggestionRuns } from '../../schema';
import { listRankedArticlesForRun } from './listRankedArticlesForRun';

export const getSuggestionRunResult = async (
  db: DbClient,
  jobId: string,
  feedId: string,
): Promise<Array<RankedArticle> | null> => {
  const run = await db.query.suggestionRuns.findFirst({
    where: eq(suggestionRuns.id, jobId),
  });

  if (!run || run.feedId !== feedId) {
    return null;
  }

  return listRankedArticlesForRun(db, jobId);
};
