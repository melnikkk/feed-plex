import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import { saveSuggestionRun } from '@feed-plex/database';
import type { Job } from 'bullmq';
import { interests as defaultInterests, SOURCES as defaultSources } from '@/constants';
import { db } from '@/db';
import { logger } from '@/logger';
import { relevantArticlesWorkflow } from '@/mastra/workflow';

export const processRelevantArticlesJob = async (
  job: Job<RelevantArticlesJobData>,
): Promise<RelevantArticlesJobResult> => {
  const sources = job.data.sources ?? defaultSources;
  const interests = job.data.interests ?? defaultInterests;

  const run = await relevantArticlesWorkflow.createRun();
  const result = await run.start({ inputData: { sources, interests } });

  if (result.status !== 'success') {
    throw new Error(`Workflow run failed with status: ${result.status}`);
  }

  const rankedArticles = result.result.rankedArticles;

  if (db && job.id) {
    try {
      await saveSuggestionRun(db, { jobId: job.id, sources, interests, rankedArticles });
    } catch (error) {
      logger.error({ err: error }, `Failed to persist suggestion run ${job.id}`);
    }
  }

  return rankedArticles;
};
