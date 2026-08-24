import type { Feed } from '@feed-plex/contracts';
import { Link } from '@tanstack/react-router';
import { EllipsisVertical, SquareArrowOutUpRight } from 'lucide-react';
import type { FC, MouseEvent } from 'react';
import { DeleteFeedMenuItem } from '@/features/deleteFeed';
import { MarkFeedViewedMenuItem } from '@/features/markFeedViewed';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui';

interface Props {
  feed: Feed;
  className?: string;
}

export const FeedOptionsMenu: FC<Props> = ({ feed, className }) => (
  <div className={className} onClick={(event: MouseEvent) => event.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Options for ${feed.name}`} />}
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={false}
            render={
              <Link to="/feeds/$id" params={{ id: feed.id }} target="_blank" rel="noreferrer" />
            }
          >
            <SquareArrowOutUpRight />
            Open in new tab
          </DropdownMenuItem>
          <MarkFeedViewedMenuItem feed={feed} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DeleteFeedMenuItem feedId={feed.id} feedName={feed.name} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
