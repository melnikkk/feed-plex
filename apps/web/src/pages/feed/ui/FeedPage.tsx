import type { FeedArticlesResponse, RankedArticle } from '@feed-plex/contracts';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  ALL_SOURCES,
  feedArticlesQueryOptions,
  filterArticlesBySource,
  sortArticles,
  type ArticleSortOption,
} from '@/entities/article';
import { feedQueryOptions } from '@/entities/feed';
import { useRefreshFeedArticles } from '@/features/refreshFeedArticles';
import { getErrorReason } from '@/shared/api';
import { FeedArticlesEmptyState } from './FeedArticlesEmptyState';
import { FeedArticlesErrorState } from './FeedArticlesErrorState';
import { FeedArticlesList } from './FeedArticlesList';
import { FeedArticlesLoadingState } from './FeedArticlesLoadingState';
import { FeedArticlesNoResultsState } from './FeedArticlesNoResultsState';
import { FeedArticlesPendingState } from './FeedArticlesPendingState';
import { FeedArticlesToolbar } from './FeedArticlesToolbar';
import { FeedPageHeader } from './FeedPageHeader';
import { FeedPageLayout } from './FeedPageLayout';

interface GetContentParams {
  feedArticles: FeedArticlesResponse | undefined;
  visibleArticles: Array<RankedArticle>;
  isPending: boolean;
  error: Error | null;
  isFetching: boolean;
  isRunning: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

const getContent = ({
  feedArticles,
  visibleArticles,
  isPending,
  error,
  isFetching,
  isRunning,
  onRefresh,
  onRetry,
  onClearFilters,
}: GetContentParams): ReactNode => {
  if (isPending) {
    return <FeedArticlesLoadingState />;
  }

  if (error || !feedArticles) {
    return (
      <FeedArticlesErrorState
        reason={getErrorReason(error)}
        isRetrying={isFetching}
        onRetry={onRetry}
      />
    );
  }

  if (!feedArticles.runId) {
    return <FeedArticlesPendingState isRunning={isRunning} onRefresh={onRefresh} />;
  }

  if (feedArticles.articles.length === 0) {
    return <FeedArticlesEmptyState isRunning={isRunning} onRefresh={onRefresh} />;
  }

  if (visibleArticles.length === 0) {
    return <FeedArticlesNoResultsState onClearFilters={onClearFilters} />;
  }

  return <FeedArticlesList articles={visibleArticles} />;
};

interface Props {
  feedId: string;
}

export const FeedPage: FC<Props> = ({ feedId }) => {
  const { data: feed } = useSuspenseQuery(feedQueryOptions(feedId));
  const {
    data: feedArticles,
    isPending,
    error,
    isFetching,
    refetch,
  } = useQuery(feedArticlesQueryOptions(feedId));
  const { refresh, isRunning } = useRefreshFeedArticles(feedId);

  const [sort, setSort] = useState<ArticleSortOption>('relevance');
  const [source, setSource] = useState<string>(ALL_SOURCES);

  const visibleArticles = useMemo(
    () =>
      feedArticles ? sortArticles(filterArticlesBySource(feedArticles.articles, source), sort) : [],
    [feedArticles, source, sort],
  );

  const hasArticles = Boolean(feedArticles && feedArticles.articles.length > 0);

  return (
    <FeedPageLayout>
      <FeedPageHeader
        feed={feed}
        completedAt={feedArticles?.completedAt ?? null}
        isRunning={isRunning}
        onRefresh={refresh}
      />
      {hasArticles && (
        <FeedArticlesToolbar
          articleCount={visibleArticles.length}
          sources={feed.sources}
          sort={sort}
          onSortChange={setSort}
          source={source}
          onSourceChange={setSource}
        />
      )}
      {getContent({
        feedArticles,
        visibleArticles,
        isPending,
        error,
        isFetching,
        isRunning,
        onRefresh: refresh,
        onRetry: () => void refetch(),
        onClearFilters: () => setSource(ALL_SOURCES),
      })}
    </FeedPageLayout>
  );
};
