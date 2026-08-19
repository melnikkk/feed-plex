import 'dotenv/config';
import './env';
import { Worker } from 'bullmq';
import { logger } from '@/logger';
import { createQueueConnection } from '@/queue/connection';
import { processRelevantArticlesJob } from '@/queue/relevantArticlesProcessor';
import { RELEVANT_ARTICLES_QUEUE_NAME } from '@/queue/relevantArticlesQueue';

const worker = new Worker(RELEVANT_ARTICLES_QUEUE_NAME, processRelevantArticlesJob, {
  connection: createQueueConnection(),
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  logger.error({ err: error }, `Job ${job?.id} failed`);
});

logger.info(`Listening for jobs on queue "${RELEVANT_ARTICLES_QUEUE_NAME}"`);
