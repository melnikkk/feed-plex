import type { JobStatusResponse } from '@feed-plex/contracts';
import { request } from './apiClient';

interface CreateFeedRunResponse {
  jobId: string;
}

export const createFeedRun = (feedId: string) =>
  request<CreateFeedRunResponse>(`/feeds/${feedId}/runs`, { method: 'POST' });

export const getFeedRun = (feedId: string, jobId: string) =>
  request<JobStatusResponse>(`/feeds/${feedId}/runs/${jobId}`);
