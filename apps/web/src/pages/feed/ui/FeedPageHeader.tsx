import type { Feed } from '@feed-plex/contracts';
import { Rss } from 'lucide-react';
import type { FC } from 'react';
import { FeedInterestBadges } from '@/entities/feed';
import { EditFeedButton } from '@/features/manageFeed';
import { RefreshArticlesButton } from '@/features/refreshFeedArticles';
import { formatRelativeTime } from '@/shared/lib';
import { FeedBackLink } from './FeedBackLink';

interface Props {
  feed: Feed;
  completedAt: string | null;
  isRunning: boolean;
  onRefresh: () => void;
}

export const FeedPageHeader: FC<Props> = ({ feed, completedAt, isRunning, onRefresh }) => (
  <div className="flex flex-col gap-4">
    <FeedBackLink />

    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{feed.name}</h1>
        <p className="text-xs text-muted-foreground">
          {feed.description || 'Articles ranked against this feed’s interest profile.'}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Rss className="size-3.5" />
            {feed.sources.length} {feed.sources.length === 1 ? 'source' : 'sources'}
          </span>
          <span aria-hidden>·</span>
          <span>
            {completedAt ? `Ranked ${formatRelativeTime(completedAt)}` : 'Not ranked yet'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <EditFeedButton feed={feed} />
        <RefreshArticlesButton isRunning={isRunning} onRefresh={onRefresh} />
      </div>
    </div>

    <FeedInterestBadges interests={feed.interests} limit={6} />
  </div>
);
