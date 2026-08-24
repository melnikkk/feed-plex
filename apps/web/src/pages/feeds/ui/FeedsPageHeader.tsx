import { RefreshCw } from 'lucide-react';
import type { FC } from 'react';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { AddFeedButton } from './AddFeedButton';

interface Props {
  feedCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const FeedsPageHeader: FC<Props> = ({ feedCount, isRefreshing, onRefresh }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-medium tracking-tight">Feeds</h1>
      <p className="text-xs text-muted-foreground">
        {feedCount === 0
          ? 'Ingest sources and rank articles against your interest profile.'
          : `${feedCount} ${feedCount === 1 ? 'feed' : 'feeds'} ranked against your interest profile.`}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw data-icon="inline-start" className={cn(isRefreshing && 'animate-spin')} />
        Refresh
      </Button>
      <AddFeedButton />
    </div>
  </div>
);
