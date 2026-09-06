import type { Feed } from '@feed-plex/contracts';
import { Link } from '@tanstack/react-router';
import { EllipsisVertical, SquareArrowOutUpRight } from 'lucide-react';
import type { FC, MouseEvent } from 'react';
import { useState } from 'react';
import { DeleteFeedDialog, DeleteFeedMenuItem } from '@/features/deleteFeed';
import { MarkFeedViewedMenuItem } from '@/features/markFeedViewed';
import { EditFeedDialog, EditFeedMenuItem } from '@/features/manageFeed';
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

export const FeedOptionsMenu: FC<Props> = ({ feed, className }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className={className} onClick={(event: MouseEvent) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Options for ${feed.name}`} />}
        >
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
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
            <EditFeedMenuItem onSelect={() => setIsEditDialogOpen(true)} />
            <MarkFeedViewedMenuItem feed={feed} />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DeleteFeedMenuItem onSelect={() => setIsDeleteDialogOpen(true)} />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditFeedDialog feed={feed} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />

      <DeleteFeedDialog
        feedId={feed.id}
        feedName={feed.name}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};
