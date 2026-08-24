import type { FC } from 'react';
import type { FeedsView } from '@/pages/feeds/model/useFeedsView';
import { Skeleton } from '@/shared/ui';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

interface Props {
  view: FeedsView;
}

export const FeedsLoadingState: FC<Props> = ({ view }) => {
  if (view === 'grid') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-44 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-px border p-px">
      {SKELETON_KEYS.map((key) => (
        <Skeleton key={key} className="h-14 w-full" />
      ))}
    </div>
  );
};
