import { useLocalStorageState } from '@/shared/lib';

export type FeedsView = 'table' | 'grid';

const FEEDS_VIEW_STORAGE_KEY = 'feed-plex:feeds-view';

const feedsViews: ReadonlyArray<FeedsView> = ['table', 'grid'];

export const isFeedsView = (value: unknown): value is FeedsView =>
  feedsViews.some((view) => view === value);

export const useFeedsView = () => useLocalStorageState(FEEDS_VIEW_STORAGE_KEY, feedsViews, 'table');
