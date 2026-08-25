import type { Feed, FeedArticlesResponse, RankedArticle } from '@feed-plex/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedPage } from '@/pages/feed';
import type * as SharedApi from '@/shared/api';

const getFeed = vi.fn<() => Promise<Feed>>();
const getFeedArticles = vi.fn<() => Promise<FeedArticlesResponse>>();

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedApi>()),
  getFeed: () => getFeed(),
  getFeedArticles: () => getFeedArticles(),
}));

const verge = 'https://theverge.com/rss.xml';
const ars = 'https://arstechnica.com/rss.xml';

const feed: Feed = {
  id: '1',
  name: 'AI news',
  description: 'Everything model-shaped.',
  sources: [
    { url: verge, sourceAffinity: 1 },
    { url: ars, sourceAffinity: 0.8 },
  ],
  interests: [{ topic: 'artificial intelligence', weight: 1, keywords: ['ai'] }],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

const buildRanked = (title: string, score: number, sourceUrl: string): RankedArticle => ({
  article: {
    title,
    link: `https://example.com/${title}`,
    summary: `${title} summary`,
    publishedAt: '2026-08-20T00:00:00.000Z',
    sourceUrl,
  },
  score,
  breakdown: {
    semanticSimilarity: 0.8,
    lexicalScore: 0.4,
    freshnessScore: 0.5,
    sourceAffinity: 1,
    noveltyPenalty: 0,
    diversityAdjustment: 0,
  },
});

const renderFeedPage = () => {
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/feeds/$id',
      component: () => <FeedPage feedId="1" />,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/feeds/',
      component: () => <span>feeds list</span>,
    }),
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/feeds/1'] }),
  });

  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {/* The page is typed against the app router; a throwaway tree stands in here. */}
      <RouterProvider router={router as never} />
    </QueryClientProvider>,
  );
};

describe('FeedPage', () => {
  it('lists ranked articles with their relevance score and source link', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockResolvedValue({
      runId: 'job-1',
      completedAt: '2026-08-20T00:00:00.000Z',
      articles: [buildRanked('Bigger model', 0.87, verge)],
    });

    renderFeedPage();

    const link = await screen.findByRole('link', { name: /Bigger model/ });

    expect(link).toHaveAttribute('href', 'https://example.com/Bigger model');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('87')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('reveals the four real score factors behind "Why this?"', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockResolvedValue({
      runId: 'job-1',
      completedAt: '2026-08-20T00:00:00.000Z',
      articles: [buildRanked('Bigger model', 0.87, verge)],
    });

    renderFeedPage();

    fireEvent.click(await screen.findByRole('button', { name: /Why this\?/ }));

    expect(await screen.findByText('Topic match')).toBeInTheDocument();
    expect(screen.getByText('Keyword overlap')).toBeInTheDocument();
    expect(screen.getByText('Freshness')).toBeInTheDocument();
    expect(screen.getByText('Source trust')).toBeInTheDocument();
    expect(screen.queryByText('Novelty')).not.toBeInTheDocument();
  });

  it('shows the pending state when no run has completed yet', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockResolvedValue({ runId: null, completedAt: null, articles: [] });

    renderFeedPage();

    expect(await screen.findByText('Ranking in progress')).toBeInTheDocument();
    expect(screen.getByText('Not ranked yet')).toBeInTheDocument();
  });

  it('shows the empty state when a run ranked nothing above the threshold', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockResolvedValue({
      runId: 'job-1',
      completedAt: '2026-08-20T00:00:00.000Z',
      articles: [],
    });

    renderFeedPage();

    expect(await screen.findByText('Nothing cleared the bar')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Sort articles' })).not.toBeInTheDocument();
  });

  it('filters by source and restores every article when cleared', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockResolvedValue({
      runId: 'job-1',
      completedAt: '2026-08-20T00:00:00.000Z',
      articles: [buildRanked('Verge story', 0.9, verge), buildRanked('Ars story', 0.6, ars)],
    });

    renderFeedPage();

    const trigger = await screen.findByRole('combobox', { name: 'Filter by source' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const option = await screen.findByRole('option', { name: 'arstechnica.com' });
    fireEvent.pointerDown(option, { pointerType: 'mouse', button: 0 });
    fireEvent.pointerUp(option, { pointerType: 'mouse', button: 0 });
    fireEvent.click(option);

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /Verge story/ })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: /Ars story/ })).toBeInTheDocument();
  });

  it('offers a retry when the articles request fails', async () => {
    getFeed.mockResolvedValue(feed);
    getFeedArticles.mockRejectedValue(new Error('boom'));

    renderFeedPage();

    expect(await screen.findByText("Couldn't load articles")).toBeInTheDocument();
  });
});
