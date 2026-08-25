import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { feedRunKeys, setActiveFeedRun } from '@/entities/feedRun';

describe('setActiveFeedRun', () => {
  it('keeps a run written without an observer past the default gc window', () => {
    const queryClient = new QueryClient();

    setActiveFeedRun(queryClient, '1', 'job-1');

    const query = queryClient.getQueryCache().find({ queryKey: feedRunKeys.active('1') });

    expect(query?.state.data).toBe('job-1');
    expect(query?.gcTime).toBe(Infinity);
  });
});
