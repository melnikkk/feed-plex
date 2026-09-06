import type {
  CreateFeedInput,
  CreateFeedResponse,
  Feed,
  UpdateFeedInput,
} from '@feed-plex/contracts';
import { request } from './apiClient';

export const getFeeds = () => request<Array<Feed>>('/feeds');

export const getFeed = (feedId: string) => request<Feed>(`/feeds/${feedId}`);

export const createFeed = (input: CreateFeedInput) =>
  request<CreateFeedResponse>('/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const updateFeed = (feedId: string, input: UpdateFeedInput) =>
  request<Feed>(`/feeds/${feedId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

export const deleteFeed = (feedId: string) =>
  request<void>(`/feeds/${feedId}`, { method: 'DELETE' });

export const markFeedViewed = (feedId: string) =>
  request<Feed>(`/feeds/${feedId}/view`, { method: 'POST' });
