import type { FC } from 'react';
import { Skeleton } from '@/shared/ui';

const FIELD_KEYS = ['a', 'b', 'c'];

export const CreateFeedFormSkeleton: FC = () => (
  <div className="flex flex-col gap-6 px-1">
    {FIELD_KEYS.map((key) => (
      <div key={key} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
    <div className="flex justify-end gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);
