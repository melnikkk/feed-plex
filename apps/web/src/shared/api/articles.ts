import type { FeedArticlesResponse } from '@feed-plex/contracts';
import { request } from './apiClient';

export const getFeedArticles = (feedId: string) =>
  request<FeedArticlesResponse>(`/feeds/${feedId}/articles`);
