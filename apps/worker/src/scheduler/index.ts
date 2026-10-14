import { REFRESH_SWEEP_QUEUE_NAME } from '@feed-plex/contracts';
import type { DbClient } from '@feed-plex/database';
import { Queue, Worker } from 'bullmq';
import { logger } from '@/logger';
import { createQueueConnection } from '@/queue/connection';
import { createRelevantArticlesQueue } from '@/queue/relevantArticlesQueue';
import {
  REFRESH_SWEEP_INTERVAL_MS,
  REFRESH_SWEEP_JOB_NAME,
  REFRESH_SWEEP_JOB_OPTIONS,
  REFRESH_SWEEP_SCHEDULER_ID,
} from '@/scheduler/constants';
import { runRefreshSweep } from '@/scheduler/refreshSweep';

export const startRefreshScheduler = async (db: DbClient): Promise<() => Promise<void>> => {
  const relevantArticlesQueue = createRelevantArticlesQueue();
  const sweepQueue = new Queue(REFRESH_SWEEP_QUEUE_NAME, {
    connection: createQueueConnection(),
    defaultJobOptions: REFRESH_SWEEP_JOB_OPTIONS,
  });

  const sweepWorker = new Worker(
    REFRESH_SWEEP_QUEUE_NAME,
    () => runRefreshSweep(db, relevantArticlesQueue),
    { connection: createQueueConnection(), concurrency: 1 },
  );

  sweepWorker.on('failed', (job, error) => {
    logger.error({ err: error }, `Refresh sweep ${job?.id} failed`);
  });

  await sweepQueue.upsertJobScheduler(
    REFRESH_SWEEP_SCHEDULER_ID,
    { every: REFRESH_SWEEP_INTERVAL_MS },
    { name: REFRESH_SWEEP_JOB_NAME },
  );

  // Guarantees startup catch-up regardless of when upsert schedules the next tick; a redundant
  // sweep is harmless because claimDueFeeds is atomic.
  await sweepQueue.add(REFRESH_SWEEP_JOB_NAME, {});

  logger.info(`Refresh scheduler sweeping every ${REFRESH_SWEEP_INTERVAL_MS / 60_000} minutes`);

  return async () => {
    await sweepWorker.close();
    await Promise.all([sweepQueue.close(), relevantArticlesQueue.close()]);
  };
};
