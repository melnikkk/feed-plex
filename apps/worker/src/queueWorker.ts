import 'dotenv/config';
import { env } from './env';
import { RELEVANT_ARTICLES_QUEUE_NAME } from '@feed-plex/contracts';
import { closeDbClient } from '@feed-plex/database';
import { Worker } from 'bullmq';
import { db } from '@/db';
import { logger } from '@/logger';
import { createQueueConnection } from '@/queue/connection';
import { processRelevantArticlesJob } from '@/queue/relevantArticlesProcessor';
import { startRefreshScheduler } from '@/scheduler';

const worker = new Worker(RELEVANT_ARTICLES_QUEUE_NAME, processRelevantArticlesJob, {
  connection: createQueueConnection(),
  concurrency: env.WORKER_CONCURRENCY,
  // Global across all worker replicas: caps Gemini embedding calls and source fetches when a
  // sweep releases a large backlog at once (e.g. after an outage).
  limiter: { max: env.WORKER_RUNS_PER_MINUTE, duration: 60_000 },
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  logger.error({ err: error }, `Job ${job?.id} failed`);
});

logger.info(`Listening for jobs on queue "${RELEVANT_ARTICLES_QUEUE_NAME}"`);

const stopRefreshScheduler = db ? await startRefreshScheduler(db) : undefined;

if (!stopRefreshScheduler) {
  logger.warn('DATABASE_URL is not set, scheduled feed refresh is disabled');
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    Promise.resolve(stopRefreshScheduler?.())
      .then(() => worker.close())
      .then(() => (db ? closeDbClient(db) : undefined))
      .finally(() => process.exit(0));
  });
}
