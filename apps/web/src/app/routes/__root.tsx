import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ThemeToggle } from '@/app/theme/themeToggle';
import { NotFoundPage } from '@/pages/notFound';

export const Route = createRootRoute({
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
