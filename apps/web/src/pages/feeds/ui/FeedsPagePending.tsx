import type { FC } from 'react';
import { useFeedsView } from '@/pages/feeds/model/useFeedsView';
import { FeedsLoadingState } from './FeedsLoadingState';
import { FeedsPageLayout } from './FeedsPageLayout';

export const FeedsPagePending: FC = () => {
  const [view] = useFeedsView();

  return (
    <FeedsPageLayout feedCount={0}>
      <FeedsLoadingState view={view} />
    </FeedsPageLayout>
  );
};
