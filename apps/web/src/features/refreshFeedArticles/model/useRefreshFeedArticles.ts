import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { articleKeys } from '@/entities/article';
import {
  activeFeedRunQueryOptions,
  feedRunStatusQueryOptions,
  isSettledFeedRun,
  setActiveFeedRun,
} from '@/entities/feedRun';
import { createFeedRun } from '@/shared/api';
import { toast } from '@/shared/ui';

export const useRefreshFeedArticles = (feedId: string) => {
  const queryClient = useQueryClient();
  const { data: activeJobId } = useQuery(activeFeedRunQueryOptions(feedId));
  const { data: run } = useQuery(feedRunStatusQueryOptions(feedId, activeJobId));
  const settledJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!run || !isSettledFeedRun(run) || settledJobIdRef.current === run.jobId) {
      return;
    }

    settledJobIdRef.current = run.jobId;
    setActiveFeedRun(queryClient, feedId, null);

    if (run.status === 'failed') {
      toast.add({ title: 'Ranking run failed', description: run.error });

      return;
    }

    void queryClient.invalidateQueries({ queryKey: articleKeys.feed(feedId) });
    toast.add({ title: 'Feed ranked', description: `${run.result.length} relevant articles.` });
  }, [run, feedId, queryClient]);

  const startRun = useMutation({
    mutationFn: () => createFeedRun(feedId),
    onSuccess: ({ jobId }) => setActiveFeedRun(queryClient, feedId, jobId),
    onError: () => toast.add({ title: "Couldn't start the ranking run" }),
  });

  return {
    refresh: () => startRun.mutate(),
    isRunning: startRun.isPending || activeJobId !== null,
  };
};
