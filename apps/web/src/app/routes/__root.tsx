import type { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { ThemeToggle } from '@/app/theme/ThemeToggle';
import { NotFoundPage } from '@/pages/notFound';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
});
