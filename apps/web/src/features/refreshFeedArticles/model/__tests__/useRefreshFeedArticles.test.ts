import type { JobStatusResponse } from '@feed-plex/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type FC, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { articleKeys } from '@/entities/article';
import { feedRunKeys, setActiveFeedRun } from '@/entities/feedRun';
import { useRefreshFeedArticles } from '@/features/refreshFeedArticles';
import type * as SharedApi from '@/shared/api';
import type * as SharedUi from '@/shared/ui';

const getFeedRun = vi.fn<() => Promise<JobStatusResponse>>();
const createFeedRun = vi.fn<() => Promise<{ jobId: string }>>();
const toastAdd = vi.fn();

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedApi>()),
  getFeedRun: () => getFeedRun(),
  createFeedRun: () => createFeedRun(),
}));

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUi>()),
  toast: { add: (options: unknown) => toastAdd(options) },
}));

const completedRun: JobStatusResponse = { jobId: 'job-1', status: 'completed', result: [] };

const renderRefreshHook = (activeJobId?: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  if (activeJobId) {
    setActiveFeedRun(queryClient, '1', activeJobId);
  }

  const wrapper: FC<{ children: ReactNode }> = ({ children }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, ...renderHook(() => useRefreshFeedArticles('1'), { wrapper }) };
};

describe('useRefreshFeedArticles', () => {
  it('adopts a run started elsewhere and settles it without a second enqueue', async () => {
    getFeedRun.mockResolvedValue(completedRun);

    const { queryClient, result } = renderRefreshHook('job-1');
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    await waitFor(() => expect(result.current.isRunning).toBe(false));

    expect(createFeedRun).not.toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: articleKeys.feed('1') });
    expect(queryClient.getQueryData(feedRunKeys.active('1'))).toBeNull();
  });

  it('reports a failed run instead of a ranked-articles toast', async () => {
    getFeedRun.mockResolvedValue({ jobId: 'job-2', status: 'failed', error: 'boom' });

    const { result } = renderRefreshHook('job-2');

    await waitFor(() => expect(result.current.isRunning).toBe(false));

    expect(toastAdd).toHaveBeenCalledWith({ title: 'Ranking run failed', description: 'boom' });
  });

  it('tracks the run it enqueues so the button stays disabled until it settles', async () => {
    createFeedRun.mockResolvedValue({ jobId: 'job-3' });
    getFeedRun.mockResolvedValue({ jobId: 'job-3', status: 'active' });

    const { queryClient, result } = renderRefreshHook();

    act(() => result.current.refresh());

    await waitFor(() => expect(queryClient.getQueryData(feedRunKeys.active('1'))).toBe('job-3'));
    expect(result.current.isRunning).toBe(true);
  });
});
