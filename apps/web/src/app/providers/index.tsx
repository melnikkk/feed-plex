import type { ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/app/routeTree.gen';

const queryClient = new QueryClient();

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function withProviders(_App: ComponentType) {
  return function WithProviders() {
    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };
}
