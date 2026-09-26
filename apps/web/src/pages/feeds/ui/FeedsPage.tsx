import type { Feed } from '@feed-plex/contracts';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { feedsQueryOptions, filterFeeds, sortFeeds, type FeedSortOption } from '@/entities/feed';
import { useFeedsView, type FeedsView } from '@/pages/feeds/model/useFeedsView';
import { FeedsEmptyState } from './FeedsEmptyState';
import { FeedsGrid } from './FeedsGrid';
import { FeedsNoResultsState } from './FeedsNoResultsState';
import { FeedsPageLayout } from './FeedsPageLayout';
import { FeedsTable } from './FeedsTable';
import { FeedsToolbar } from './FeedsToolbar';

interface GetContentParams {
  feeds: Array<Feed>;
  visibleFeeds: Array<Feed>;
  view: FeedsView;
  search: string;
  onClearSearch: () => void;
}

const getContent = ({
  feeds,
  visibleFeeds,
  view,
  search,
  onClearSearch,
}: GetContentParams): ReactNode => {
  if (feeds.length === 0) {
    return <FeedsEmptyState />;
  }

  if (visibleFeeds.length === 0) {
    return <FeedsNoResultsState search={search} onClearSearch={onClearSearch} />;
  }

  if (view === 'grid') {
    return <FeedsGrid feeds={visibleFeeds} />;
  }

  return <FeedsTable feeds={visibleFeeds} />;
};

export const FeedsPage: FC = () => {
  const { data: feeds } = useSuspenseQuery(feedsQueryOptions());

  const [view, setView] = useFeedsView();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FeedSortOption>('recentlyUpdated');

  const visibleFeeds = useMemo(
    () => sortFeeds(filterFeeds(feeds, search), sort),
    [feeds, search, sort],
  );

  return (
    <FeedsPageLayout feedCount={feeds.length}>
      {feeds.length > 0 && (
        <FeedsToolbar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      )}
      {getContent({
        feeds,
        visibleFeeds,
        view,
        search,
        onClearSearch: () => setSearch(''),
      })}
    </FeedsPageLayout>
  );
};
