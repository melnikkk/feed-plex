import { Queue } from 'bullmq';
import { createQueueConnection } from '@/queue/connection';
import {
  ONE_HOUR_SECONDS,
  RELEVANT_ARTICLES_QUEUE_NAME,
} from '@/routes/relevantArticlesRuns/constants';
import type {
  RelevantArticlesJobData,
  RelevantArticlesJobResult,
} from '@/routes/relevantArticlesRuns/types';

export const relevantArticlesQueue = new Queue<RelevantArticlesJobData, RelevantArticlesJobResult>(
  RELEVANT_ARTICLES_QUEUE_NAME,
  {
    connection: createQueueConnection(),
    defaultJobOptions: {
      removeOnComplete: { age: ONE_HOUR_SECONDS },
      removeOnFail: { age: ONE_HOUR_SECONDS },
    },
  },
);
