import type { Feed } from '@feed-plex/contracts';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { feedsQueryOptions, filterFeeds, sortFeeds, type FeedSortOption } from '@/entities/feed';
import type { FeedsView } from '@/pages/feeds/model/useFeedsView';
import { FeedsEmptyState } from './FeedsEmptyState';
import { FeedsGrid } from './FeedsGrid';
import { FeedsNoResultsState } from './FeedsNoResultsState';
import { FeedsPageHeader } from './FeedsPageHeader';
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

interface Props {
  view: FeedsView;
  onViewChange: (view: FeedsView) => void;
}

export const FeedsPageContent: FC<Props> = ({ view, onViewChange }) => {
  const { data: feeds, isFetching, refetch } = useSuspenseQuery(feedsQueryOptions());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FeedSortOption>('recentlyUpdated');

  const visibleFeeds = useMemo(
    () => sortFeeds(filterFeeds(feeds, search), sort),
    [feeds, search, sort],
  );

  return (
    <>
      <FeedsPageHeader
        feedCount={feeds.length}
        isRefreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      {feeds.length > 0 && (
        <FeedsToolbar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={onViewChange}
        />
      )}
      {getContent({
        feeds,
        visibleFeeds,
        view,
        search,
        onClearSearch: () => setSearch(''),
      })}
    </>
  );
};
