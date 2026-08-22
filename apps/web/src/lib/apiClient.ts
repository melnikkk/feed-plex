import type { Feed } from '@feed-plex/contracts';
import { env } from '@/env';

type HealthResponse = { status: string };

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${env.VITE_API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getHealth = () => request<HealthResponse>('/health');

export const getFeeds = () => request<Feed[]>('/feeds');
