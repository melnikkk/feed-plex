import type { Feed } from '@feed-plex/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '@/entities/feed';
import { markFeedViewed } from '@/shared/api';

export const useMarkFeedViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markFeedViewed,
    onSuccess: (feed) => {
      queryClient.setQueryData<Array<Feed>>(feedKeys.lists(), (feeds) =>
        feeds?.map((existing) => (existing.id === feed.id ? feed : existing)),
      );
      queryClient.setQueryData<Feed>(feedKeys.detail(feed.id), feed);
    },
  });
};
