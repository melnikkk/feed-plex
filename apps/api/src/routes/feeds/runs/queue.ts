import type { RelevantArticlesJobData, RelevantArticlesJobResult } from '@feed-plex/contracts';
import { RELEVANT_ARTICLES_QUEUE_NAME } from '@feed-plex/contracts';
import { Queue } from 'bullmq';
import { createQueueConnection } from '@/queue/connection';
import { ONE_HOUR_SECONDS } from '@/routes/feeds/runs/constants';

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
