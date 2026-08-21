import type { JobStatus } from '@/routes/feeds/runs/types';

export const toJobStatus = (state: string): JobStatus => {
  switch (state) {
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    case 'active':
      return 'active';
    default:
      return 'queued';
  }
};
