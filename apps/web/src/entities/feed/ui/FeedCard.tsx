import type { Feed } from '@feed-plex/contracts';
import { Rss } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { isFeedNew } from '@/entities/feed/model/isFeedNew';
import { FeedInterestBadges } from './FeedInterestBadges';
import { formatRelativeTime } from '@/shared/lib';
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

interface Props {
  feed: Feed;
  actions?: ReactNode;
  className?: string;
}

export const FeedCard: FC<Props> = ({ feed, actions, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex min-w-0 items-center gap-2">
        <span className="truncate">{feed.name}</span>
        {isFeedNew(feed) && <Badge>New</Badge>}
      </CardTitle>
      <CardDescription className="line-clamp-2">
        {feed.description || 'No description yet.'}
      </CardDescription>
      {actions && <CardAction>{actions}</CardAction>}
    </CardHeader>
    <CardContent className="flex-1">
      <FeedInterestBadges interests={feed.interests} limit={3} />
    </CardContent>
    <CardFooter className="justify-between gap-2 text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Rss className="size-3.5" />
        {feed.sources.length} {feed.sources.length === 1 ? 'source' : 'sources'}
      </span>
      <span className="truncate">Updated {formatRelativeTime(feed.updatedAt)}</span>
    </CardFooter>
  </Card>
);
