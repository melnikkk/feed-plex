import type { Feed } from '@feed-plex/contracts';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { FeedCard } from '@/entities/feed';
import { FeedOptionsMenu } from './FeedOptionsMenu';

interface Props {
  feed: Feed;
}

/**
 * The card is made clickable by an overlay link rather than by wrapping the
 * card in an anchor — the options menu is interactive and may not nest inside
 * one. The menu is lifted above the overlay with `z-10`.
 */
export const FeedsGridItem: FC<Props> = ({ feed }) => (
  <div className="group relative h-full">
    <FeedCard
      feed={feed}
      className="h-full transition-[box-shadow,color] group-hover:ring-foreground/30"
      actions={<FeedOptionsMenu feed={feed} className="relative z-10" />}
    />
    <Link
      to="/feeds/$id"
      params={{ id: feed.id }}
      className="absolute inset-0 outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
    >
      <span className="sr-only">Open {feed.name}</span>
    </Link>
  </div>
);
