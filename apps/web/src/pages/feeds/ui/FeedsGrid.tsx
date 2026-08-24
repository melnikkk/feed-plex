import type { Feed } from '@feed-plex/contracts';
import type { FC } from 'react';
import { FeedsGridItem } from './FeedsGridItem';

interface Props {
  feeds: Array<Feed>;
}

export const FeedsGrid: FC<Props> = ({ feeds }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {feeds.map((feed) => (
      <FeedsGridItem key={feed.id} feed={feed} />
    ))}
  </div>
);
