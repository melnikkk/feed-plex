import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '@/entities/feed';
import { deleteFeed } from '@/shared/api';

export const useDeleteFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFeed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKeys.all }),
  });
};
