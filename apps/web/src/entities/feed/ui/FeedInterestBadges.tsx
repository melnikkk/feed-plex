import type { Interest } from '@feed-plex/contracts';
import type { FC } from 'react';
import { Badge } from '@/shared/ui';

interface Props {
  interests: Array<Interest>;
  limit?: number;
}

export const FeedInterestBadges: FC<Props> = ({ interests, limit = 2 }) => {
  if (interests.length === 0) {
    return <span className="text-muted-foreground">No interests</span>;
  }

  const visibleInterests = interests.slice(0, limit);
  const hiddenCount = interests.length - visibleInterests.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleInterests.map((interest) => (
        <Badge key={interest.topic} variant="secondary">
          {interest.topic}
        </Badge>
      ))}
      {hiddenCount > 0 && <Badge variant="outline">+{hiddenCount}</Badge>}
    </div>
  );
};
