import { queryOptions } from '@tanstack/react-query';
import { getFeedArticles } from '@/shared/api';

const PENDING_RUN_POLL_INTERVAL_MS = 15_000;

export const articleKeys = {
  all: ['articles'] as const,

  feeds: () => [...articleKeys.all, 'feed'] as const,

  feed: (feedId: string) => [...articleKeys.feeds(), feedId] as const,
};

export const feedArticlesQueryOptions = (feedId: string) =>
  queryOptions({
    queryKey: articleKeys.feed(feedId),
    queryFn: () => getFeedArticles(feedId),
    staleTime: 60_000,
    refetchInterval: (query) => (query.state.data?.runId ? false : PENDING_RUN_POLL_INTERVAL_MS),
  });
