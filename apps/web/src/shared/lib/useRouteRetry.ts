import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useRouteRetry = () => {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  const retry = async () => {
    setIsRetrying(true);

    try {
      await router.invalidate();
    } finally {
      setIsRetrying(false);
    }
  };

  return { retry, isRetrying };
};
