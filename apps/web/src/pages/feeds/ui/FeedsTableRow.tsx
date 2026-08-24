import type { Feed } from '@feed-plex/contracts';
import { Link } from '@tanstack/react-router';
import type { FC, MouseEvent } from 'react';
import { FeedInterestBadges, isFeedNew } from '@/entities/feed';
import { useOpenFeed } from '@/pages/feeds/model/useOpenFeed';
import { formatRelativeTime } from '@/shared/lib';
import { Badge, TableCell, TableRow } from '@/shared/ui';
import { FeedOptionsMenu } from './FeedOptionsMenu';

interface Props {
  feed: Feed;
}

export const FeedsTableRow: FC<Props> = ({ feed }) => {
  const openFeed = useOpenFeed();

  return (
    <TableRow className="cursor-pointer" onClick={() => openFeed(feed.id)}>
      <TableCell className="max-w-md">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/feeds/$id"
              params={{ id: feed.id }}
              onClick={(event: MouseEvent) => event.stopPropagation()}
              className="truncate font-medium outline-none hover:underline focus-visible:ring-1 focus-visible:ring-ring/50"
            >
              {feed.name}
            </Link>
            {isFeedNew(feed) && <Badge>New</Badge>}
          </div>
          {feed.description && <p className="truncate text-muted-foreground">{feed.description}</p>}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{feed.sources.length}</Badge>
      </TableCell>
      <TableCell>
        <FeedInterestBadges interests={feed.interests} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatRelativeTime(feed.updatedAt)}
      </TableCell>
      <TableCell className="text-right">
        <FeedOptionsMenu feed={feed} />
      </TableCell>
    </TableRow>
  );
};
