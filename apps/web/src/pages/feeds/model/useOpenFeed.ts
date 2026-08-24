import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

export const useOpenFeed = () => {
  const navigate = useNavigate();

  return useCallback(
    (feedId: string) => navigate({ to: '/feeds/$id', params: { id: feedId } }),
    [navigate],
  );
};
