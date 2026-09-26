import type { Feed } from '@feed-plex/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { feedsQueryOptions } from '@/entities/feed';
import { FeedsPage, FeedsPageError } from '@/pages/feeds';
import type * as SharedApi from '@/shared/api';

const getFeeds = vi.fn<() => Promise<Array<Feed>>>();

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedApi>()),
  getFeeds: () => getFeeds(),
}));

const buildFeed = (overrides: Partial<Feed> & Pick<Feed, 'id' | 'name'>): Feed => ({
  sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 1 }],
  interests: [{ topic: 'artificial intelligence', weight: 1, keywords: ['ai'] }],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
  lastViewedAt: '2026-08-21T00:00:00.000Z',
  ...overrides,
});

const renderFeedsPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/feeds/',
      loader: () => queryClient.ensureQueryData(feedsQueryOptions()),
      errorComponent: FeedsPageError,
      component: FeedsPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/feeds/$id',
      component: () => <span>feed detail</span>,
    }),
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/feeds'] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {/* The page is typed against the app router; a throwaway tree stands in here. */}
      <RouterProvider router={router as never} />
    </QueryClientProvider>,
  );
};

describe('FeedsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('lists feeds in a table by default', async () => {
    getFeeds.mockResolvedValue([
      buildFeed({ id: '1', name: 'Frontend Weekly' }),
      buildFeed({ id: '2', name: 'Backend Digest' }),
    ]);

    renderFeedsPage();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Feed' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Frontend Weekly' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Backend Digest' })).toBeInTheDocument();
  });

  it('switches to the card grid and drops the table', async () => {
    getFeeds.mockResolvedValue([buildFeed({ id: '1', name: 'Frontend Weekly' })]);

    renderFeedsPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Grid view' }));

    await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Open Frontend Weekly' })).toBeInTheDocument();
  });

  it('filters feeds by search and restores them when cleared', async () => {
    getFeeds.mockResolvedValue([
      buildFeed({ id: '1', name: 'Frontend Weekly' }),
      buildFeed({ id: '2', name: 'Backend Digest' }),
    ]);

    renderFeedsPage();

    const search = await screen.findByRole('textbox', { name: 'Search feeds' });
    fireEvent.change(search, { target: { value: 'backend' } });

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Frontend Weekly' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: 'Backend Digest' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(await screen.findByRole('link', { name: 'Frontend Weekly' })).toBeInTheDocument();
  });

  it('offers the row menu link as a new-tab anchor', async () => {
    getFeeds.mockResolvedValue([buildFeed({ id: '1', name: 'Frontend Weekly' })]);

    renderFeedsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Options for Frontend Weekly' }));

    const openLink = await screen.findByRole('menuitem', { name: 'Open in new tab' });

    expect(openLink).toHaveAttribute('href', '/feeds/1');
    expect(openLink).toHaveAttribute('target', '_blank');
  });

  it('shows a no-results state when nothing matches the search', async () => {
    getFeeds.mockResolvedValue([buildFeed({ id: '1', name: 'Frontend Weekly' })]);

    renderFeedsPage();

    fireEvent.change(await screen.findByRole('textbox', { name: 'Search feeds' }), {
      target: { value: 'nothing matches this' },
    });

    expect(await screen.findByText('No feeds match "nothing matches this"')).toBeInTheDocument();
  });

  it('shows the empty state and hides the toolbar when there are no feeds', async () => {
    getFeeds.mockResolvedValue([]);

    renderFeedsPage();

    expect(await screen.findByText('No feeds yet')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Search feeds' })).not.toBeInTheDocument();
  });

  it('offers a retry when the request fails', async () => {
    getFeeds.mockRejectedValue(new Error('boom'));

    renderFeedsPage();

    expect(await screen.findByText("Couldn't load feeds")).toBeInTheDocument();
    expect(
      screen.getByText('Something unexpected happened. Please try again.'),
    ).toBeInTheDocument();

    getFeeds.mockResolvedValue([buildFeed({ id: '1', name: 'Frontend Weekly' })]);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('link', { name: 'Frontend Weekly' })).toBeInTheDocument();
  });
});
