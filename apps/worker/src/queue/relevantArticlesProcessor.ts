import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import type { Job } from 'bullmq';
import { relevantArticlesWorkflow } from '@/mastra/workflow';
import { interests as defaultInterests, SOURCES as defaultSources } from '@/constants';

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

  return result.result.rankedArticles;
};
