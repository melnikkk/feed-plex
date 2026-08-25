import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import { getFeedById, saveSuggestionRun } from '@feed-plex/database';
import type { Job } from 'bullmq';
import { db } from '@/db';
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

  if (!job.id) {
    throw new Error('Cannot persist a suggestion run for a job without an id');
  }

  await saveSuggestionRun(db, {
    jobId: job.id,
    feedId: feed.id,
    sources,
    interests,
    rankedArticles,
  });

  return rankedArticles;
};
