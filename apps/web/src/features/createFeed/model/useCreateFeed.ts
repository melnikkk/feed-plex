import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '@/entities/feed';
import { setActiveFeedRun } from '@/entities/feedRun';
import { createFeed } from '@/shared/api';

export const useCreateFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeed,
    onSuccess: ({ id, jobId }) => {
      if (jobId) {
        setActiveFeedRun(queryClient, id, jobId);
      }

      return queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
};
