import type { FC } from 'react';
import { FeedArticlesLoadingState } from './FeedArticlesLoadingState';
import { FeedPageHeaderSkeleton } from './FeedPageHeaderSkeleton';
import { FeedPageLayout } from './FeedPageLayout';

export const FeedPagePending: FC = () => (
  <FeedPageLayout>
    <FeedPageHeaderSkeleton />
    <FeedArticlesLoadingState />
  </FeedPageLayout>
);
