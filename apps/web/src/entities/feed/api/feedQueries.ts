import { queryOptions } from '@tanstack/react-query';
import { getFeed, getFeeds } from '@/shared/api';

export const feedKeys = {
  all: ['feeds'] as const,

  lists: () => [...feedKeys.all, 'list'] as const,

  details: () => [...feedKeys.all, 'detail'] as const,

  detail: (feedId: string) => [...feedKeys.details(), feedId] as const,
};

export const feedsQueryOptions = () =>
  queryOptions({
    queryKey: feedKeys.lists(),
    queryFn: getFeeds,
    staleTime: 60_000,
  });

export const feedQueryOptions = (feedId: string) =>
  queryOptions({
    queryKey: feedKeys.detail(feedId),
    queryFn: () => getFeed(feedId),
    staleTime: 60_000,
  });
