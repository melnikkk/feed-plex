import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '@/entities/feed';
import { createFeed } from '@/shared/api';

export const useCreateFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedKeys.all }),
  });
};
