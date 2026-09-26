import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorPage } from '@/pages/error';
import { ApiError } from '@/shared/api';

const renderFailingRoute = (loader: () => Promise<string>) => {
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/feeds/',
      loader,
      component: () => <span>feeds loaded</span>,
    }),
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/feeds'] }),
    defaultErrorComponent: ErrorPage,
  });

  return render(<RouterProvider router={router as never} />);
};

describe('ErrorPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a user-friendly reason when a route loader throws', async () => {
    renderFailingRoute(() =>
      Promise.reject(new ApiError(500, '/feeds', { error: 'Internal Server Error' })),
    );

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('The server ran into a problem. Please try again in a moment.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Internal Server Error|500/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to feeds' })).toHaveAttribute('href', '/feeds');
  });

  it('re-runs the loader and recovers on retry', async () => {
    const loader = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('ok');

    renderFailingRoute(loader);

    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('feeds loaded')).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('reloads the whole page', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    renderFailingRoute(() => Promise.reject(new Error('boom')));

    fireEvent.click(await screen.findByRole('button', { name: 'Reload page' }));

    expect(reload).toHaveBeenCalledOnce();
  });
});
