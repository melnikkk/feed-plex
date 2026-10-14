import type { JobsOptions } from 'bullmq';

export const REFRESH_SWEEP_SCHEDULER_ID = 'feed-refresh-sweep';

export const REFRESH_SWEEP_JOB_NAME = 'sweep';

export const REFRESH_SWEEP_INTERVAL_MS = 5 * 60_000;

export const REFRESH_CLAIM_BATCH_SIZE = 500;

export const REFRESH_SWEEP_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: { count: 20 },
  removeOnFail: { count: 50 },
};

export const SCHEDULED_RUN_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 60_000 },
};
