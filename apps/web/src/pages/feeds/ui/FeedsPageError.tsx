import type { FC } from 'react';
import { getErrorReason } from '@/shared/api';
import { useRouteRetry } from '@/shared/lib';
import { FeedsErrorState } from './FeedsErrorState';
import { FeedsPageLayout } from './FeedsPageLayout';

interface Props {
  error: Error;
}

export const FeedsPageError: FC<Props> = ({ error }) => {
  const { retry, isRetrying } = useRouteRetry();

  return (
    <FeedsPageLayout feedCount={0}>
      <FeedsErrorState
        reason={getErrorReason(error)}
        isRetrying={isRetrying}
        onRetry={() => void retry()}
      />
    </FeedsPageLayout>
  );
};
