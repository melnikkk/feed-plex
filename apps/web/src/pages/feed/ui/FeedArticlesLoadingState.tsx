import type { FC } from 'react';
import { Skeleton } from '@/shared/ui';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e'];

export const FeedArticlesLoadingState: FC = () => (
  <div className="flex flex-col gap-4">
    {SKELETON_KEYS.map((key) => (
      <Skeleton key={key} className="h-36 w-full" />
    ))}
  </div>
);
