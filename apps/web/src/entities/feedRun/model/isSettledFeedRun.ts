import type { JobStatusResponse } from '@feed-plex/contracts';

export type SettledFeedRun = Extract<JobStatusResponse, { status: 'completed' | 'failed' }>;

export const isSettledFeedRun = (run: JobStatusResponse): run is SettledFeedRun =>
  run.status === 'completed' || run.status === 'failed';
