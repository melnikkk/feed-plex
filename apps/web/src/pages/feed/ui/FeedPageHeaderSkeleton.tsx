import type { FC } from 'react';
import { Skeleton } from '@/shared/ui';
import { FeedBackLink } from './FeedBackLink';

const BADGE_KEYS = ['a', 'b', 'c', 'd'];

export const FeedPageHeaderSkeleton: FC = () => (
  <div className="flex flex-col gap-4">
    <FeedBackLink />

    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>

    <div className="flex flex-wrap gap-1">
      {BADGE_KEYS.map((key) => (
        <Skeleton key={key} className="h-5 w-20" />
      ))}
    </div>
  </div>
);
