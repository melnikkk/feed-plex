import type { FC } from 'react';
import { getErrorReason } from '@/shared/api';
import { useRouteRetry } from '@/shared/lib';
import { FeedErrorState } from './FeedErrorState';
import { FeedPageLayout } from './FeedPageLayout';

interface Props {
  error: Error;
}

export const FeedPageError: FC<Props> = ({ error }) => {
  const { retry, isRetrying } = useRouteRetry();

  return (
    <FeedPageLayout>
      <FeedErrorState
        reason={getErrorReason(error)}
        isRetrying={isRetrying}
        onRetry={() => void retry()}
      />
    </FeedPageLayout>
  );
};
