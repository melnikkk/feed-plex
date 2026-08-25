import type { FC } from 'react';
import { Skeleton } from '@/shared/ui';
import { FeedArticlesLoadingState } from './FeedArticlesLoadingState';

export const FeedPageSkeleton: FC = () => (
  <>
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-5 w-40" />
    </div>
    <FeedArticlesLoadingState />
  </>
);
