import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import { getFeedById, saveSuggestionRun } from '@feed-plex/database';
import type { Job } from 'bullmq';
import { db } from '@/db';
import { logger } from '@/logger';
import { relevantArticlesWorkflow } from '@/mastra/workflow';

export const processRelevantArticlesJob = async (
  job: Job<RelevantArticlesJobData>,
): Promise<RelevantArticlesJobResult> => {
  if (!db) {
    throw new Error('DATABASE_URL is required to process feed-scoped runs');
  }

  const feed = await getFeedById(db, job.data.feedId);

  if (!feed) {
    throw new Error(`Feed not found: ${job.data.feedId}`);
  }

  const { sources, interests } = feed;

  const run = await relevantArticlesWorkflow.createRun();
  const result = await run.start({ inputData: { sources, interests } });

  if (result.status !== 'success') {
    throw new Error(`Workflow run failed with status: ${result.status}`);
  }

  const rankedArticles = result.result.rankedArticles;

  if (job.id) {
    try {
      await saveSuggestionRun(db, {
        jobId: job.id,
        feedId: feed.id,
        sources,
        interests,
        rankedArticles,
      });
    } catch (error) {
      logger.error({ err: error }, `Failed to persist suggestion run ${job.id}`);
    }
  }

  return rankedArticles;
};
