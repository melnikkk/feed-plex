import type { Feed } from '@feed-plex/contracts';
import { Check } from 'lucide-react';
import type { FC } from 'react';
import { isFeedNew } from '@/entities/feed';
import { useMarkFeedViewed } from '@/features/markFeedViewed/model/useMarkFeedViewed';
import { DropdownMenuItem } from '@/shared/ui';

interface Props {
  feed: Feed;
}

export const MarkFeedViewedMenuItem: FC<Props> = ({ feed }) => {
  const markFeedViewedMutation = useMarkFeedViewed();

  if (!isFeedNew(feed)) {
    return null;
  }

  return (
    <DropdownMenuItem
      disabled={markFeedViewedMutation.isPending}
      onClick={() => markFeedViewedMutation.mutate(feed.id)}
    >
      <Check />
      Mark as read
    </DropdownMenuItem>
  );
};
