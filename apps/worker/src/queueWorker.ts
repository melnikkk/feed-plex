import 'dotenv/config';
import './env';
import { RELEVANT_ARTICLES_QUEUE_NAME } from '@feed-plex/contracts';
import { closeDbClient } from '@feed-plex/database';
import { Worker } from 'bullmq';
import { db } from '@/db';
import { logger } from '@/logger';
import { createQueueConnection } from '@/queue/connection';
import { processRelevantArticlesJob } from '@/queue/relevantArticlesProcessor';

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

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    worker
      .close()
      .then(() => (db ? closeDbClient(db) : undefined))
      .finally(() => process.exit(0));
  });
}
