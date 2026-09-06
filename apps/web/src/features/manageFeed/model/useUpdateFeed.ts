import type { Feed, UpdateFeedInput } from '@feed-plex/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '@/entities/feed';
import { setActiveFeedRun } from '@/entities/feedRun';
import { createFeedRun, updateFeed } from '@/shared/api';
import { toast } from '@/shared/ui';

interface UpdateFeedVariables {
  feedId: string;
  input: UpdateFeedInput;
  regenerate: boolean;
}

export const useUpdateFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedId, input }: UpdateFeedVariables) => updateFeed(feedId, input),
    onSuccess: async (feed, { regenerate }) => {
      queryClient.setQueryData<Array<Feed>>(feedKeys.lists(), (feeds) =>
        feeds?.map((existing) => (existing.id === feed.id ? feed : existing)),
      );
      queryClient.setQueryData<Feed>(feedKeys.detail(feed.id), feed);

      if (!regenerate) {
        return;
      }

      try {
        const { jobId } = await createFeedRun(feed.id);

        setActiveFeedRun(queryClient, feed.id, jobId);
      } catch {
        toast.add({ title: 'Feed saved', description: "Couldn't start the ranking run." });
      }
    },
  });
};
