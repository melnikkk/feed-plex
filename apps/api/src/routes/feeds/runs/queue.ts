import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import {
  RELEVANT_ARTICLES_JOB_NAME,
  RELEVANT_ARTICLES_JOB_RETENTION_SECONDS,
  RELEVANT_ARTICLES_QUEUE_NAME,
} from '@feed-plex/contracts';
import { Queue } from 'bullmq';
import { createQueueConnection } from '@/queue/connection';

export const relevantArticlesQueue = new Queue<RelevantArticlesJobData, RelevantArticlesJobResult>(
  RELEVANT_ARTICLES_QUEUE_NAME,
  {
    connection: createQueueConnection(),
    defaultJobOptions: {
      removeOnComplete: { age: RELEVANT_ARTICLES_JOB_RETENTION_SECONDS },
      removeOnFail: { age: RELEVANT_ARTICLES_JOB_RETENTION_SECONDS },
    },
  },
);

export const enqueueRelevantArticlesRun = async (feedId: string): Promise<string> => {
  const job = await relevantArticlesQueue.add(RELEVANT_ARTICLES_JOB_NAME, { feedId });

  if (!job.id) {
    throw new Error('Queued job is missing an id');
  }

  return job.id;
};
