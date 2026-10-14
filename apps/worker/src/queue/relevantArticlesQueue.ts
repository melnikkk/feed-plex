import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import {
  RELEVANT_ARTICLES_JOB_RETENTION_SECONDS,
  RELEVANT_ARTICLES_QUEUE_NAME,
} from '@feed-plex/contracts';
import { Queue } from 'bullmq';
import { createQueueConnection } from '@/queue/connection';

export const createRelevantArticlesQueue = () =>
  new Queue<RelevantArticlesJobData, RelevantArticlesJobResult>(RELEVANT_ARTICLES_QUEUE_NAME, {
    connection: createQueueConnection(),
    defaultJobOptions: {
      removeOnComplete: { age: RELEVANT_ARTICLES_JOB_RETENTION_SECONDS },
      removeOnFail: { age: RELEVANT_ARTICLES_JOB_RETENTION_SECONDS },
    },
  });
