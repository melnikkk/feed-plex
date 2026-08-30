import type { FC } from 'react';
import { CreateFeedDialog } from '@/features/createFeed';

interface Props {
  feedCount: number;
}

export const FeedsPageHeader: FC<Props> = ({ feedCount }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-medium tracking-tight">Feeds</h1>
      <p className="text-xs text-muted-foreground">
        {feedCount === 0
          ? 'Ingest sources and rank articles against your interest profile.'
          : `${feedCount} ${feedCount === 1 ? 'feed' : 'feeds'} ranked against your interest profile.`}
      </p>
    </div>
    <CreateFeedDialog />
  </div>
);
