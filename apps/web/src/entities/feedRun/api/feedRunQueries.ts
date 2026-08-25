import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { isSettledFeedRun } from '@/entities/feedRun/model/isSettledFeedRun';
import { getFeedRun } from '@/shared/api';

const POLL_INTERVAL_MS = 1500;

export const feedRunKeys = {
  all: ['feed-runs'] as const,

  feed: (feedId: string) => [...feedRunKeys.all, feedId] as const,

  active: (feedId: string) => [...feedRunKeys.feed(feedId), 'active'] as const,

  status: (feedId: string, jobId: string) => [...feedRunKeys.feed(feedId), jobId] as const,
};

/**
 * Cache-as-store: the query never fetches, `setActiveFeedRun` is the only writer. Keeping the
 * in-flight job id here (rather than in component state) lets a run started on the feeds list
 * survive navigation to the feed page.
 */
export const activeFeedRunQueryOptions = (feedId: string) =>
  queryOptions<string | null>({
    queryKey: feedRunKeys.active(feedId),
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const setActiveFeedRun = (
  queryClient: QueryClient,
  feedId: string,
  jobId: string | null,
) => {
  queryClient.setQueryData(feedRunKeys.active(feedId), jobId);
};

export const feedRunStatusQueryOptions = (feedId: string, jobId: string | null) =>
  queryOptions({
    queryKey: feedRunKeys.status(feedId, jobId ?? ''),
    queryFn: () => {
      if (jobId === null) {
        throw new Error(`Missing job id for feed run status query: ${feedId}`);
      }

      return getFeedRun(feedId, jobId);
    },
    enabled: jobId !== null,
    gcTime: 0,
    refetchInterval: (query) =>
      query.state.data && isSettledFeedRun(query.state.data) ? false : POLL_INTERVAL_MS,
  });
