import type { Feed } from '@feed-plex/contracts';
import { Clock } from 'lucide-react';
import type { FC } from 'react';
import { formatRefreshInterval } from '@/entities/feed';
import { formatRelativeTime } from '@/shared/lib';

interface Props {
  feed: Feed;
}

const getScheduleText = ({ refreshIntervalHours, nextRefreshAt }: Feed): string => {
  if (refreshIntervalHours === null) {
    return 'Auto-refresh off';
  }

  const interval = formatRefreshInterval(refreshIntervalHours).toLowerCase();

  if (!nextRefreshAt || Date.parse(nextRefreshAt) <= Date.now()) {
    return `Refreshes ${interval} · due now`;
  }

  return `Refreshes ${interval} · next ${formatRelativeTime(nextRefreshAt)}`;
};

export const FeedRefreshSchedule: FC<Props> = ({ feed }) => (
  <span className="inline-flex items-center gap-1.5">
    <Clock className="size-3.5" />
    {getScheduleText(feed)}
  </span>
);
