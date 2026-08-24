import type { Feed } from '@feed-plex/contracts';
import { useQuery } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { feedsQueryOptions, filterFeeds, sortFeeds, type FeedSortOption } from '@/entities/feed';
import { useFeedsView, type FeedsView } from '@/pages/feeds/model/useFeedsView';
import { FeedsEmptyState } from './FeedsEmptyState';
import { FeedsErrorState } from './FeedsErrorState';
import { FeedsGrid } from './FeedsGrid';
import { FeedsLoadingState } from './FeedsLoadingState';
import { FeedsNoResultsState } from './FeedsNoResultsState';
import { FeedsPageHeader } from './FeedsPageHeader';
import { FeedsTable } from './FeedsTable';
import { FeedsToolbar } from './FeedsToolbar';

interface GetContentParams {
  feeds: Array<Feed> | undefined;
  visibleFeeds: Array<Feed>;
  view: FeedsView;
  search: string;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  onClearSearch: () => void;
  onRetry: () => void;
}

const getContent = ({
  feeds,
  visibleFeeds,
  view,
  search,
  isPending,
  isError,
  isFetching,
  onClearSearch,
  onRetry,
}: GetContentParams): ReactNode => {
  if (isPending) {
    return <FeedsLoadingState view={view} />;
  }

  if (isError || !feeds) {
    return <FeedsErrorState isRetrying={isFetching} onRetry={onRetry} />;
  }

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
  const { data: feeds, isPending, isError, isFetching, refetch } = useQuery(feedsQueryOptions());
  const [view, setView] = useFeedsView();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<FeedSortOption>('recentlyUpdated');

  const visibleFeeds = useMemo(
    () => (feeds ? sortFeeds(filterFeeds(feeds, search), sort) : []),
    [feeds, search, sort],
  );

  const hasFeeds = Boolean(feeds && feeds.length > 0);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-16 pb-12">
        <FeedsPageHeader
          feedCount={feeds?.length ?? 0}
          isRefreshing={isFetching}
          onRefresh={() => void refetch()}
        />
        {hasFeeds && (
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
          isPending,
          isError,
          isFetching,
          onClearSearch: () => setSearch(''),
          onRetry: () => void refetch(),
        })}
      </div>
    </main>
  );
};
