import type { Feed } from '@feed-plex/contracts';
import { request } from './apiClient';

export const getFeeds = () => request<Array<Feed>>('/feeds');

export const getFeed = (feedId: string) => request<Feed>(`/feeds/${feedId}`);

export const deleteFeed = (feedId: string) =>
  request<void>(`/feeds/${feedId}`, { method: 'DELETE' });

export const markFeedViewed = (feedId: string) =>
  request<Feed>(`/feeds/${feedId}/view`, { method: 'POST' });
