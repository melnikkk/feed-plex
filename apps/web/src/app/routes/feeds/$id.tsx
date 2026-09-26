import { createFileRoute, notFound, type ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';
import { feedArticlesQueryOptions } from '@/entities/article';
import { feedQueryOptions } from '@/entities/feed';
import { useMarkFeedViewed } from '@/features/markFeedViewed';
import { ErrorPage } from '@/pages/error';
import { FeedPage, FeedPageError, FeedPagePending } from '@/pages/feed';
import { ApiError, isRequestError } from '@/shared/api';

export const Route = createFileRoute('/feeds/$id')({
  loader: async ({ params, context }) => {
    void context.queryClient.prefetchQuery(feedArticlesQueryOptions(params.id));

    try {
      await context.queryClient.ensureQueryData(feedQueryOptions(params.id));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  pendingComponent: FeedPagePending,
  errorComponent: FeedRouteError,
  component: FeedRoute,
});

function FeedRouteError({ error }: ErrorComponentProps) {
  if (isRequestError(error)) {
    return <FeedPageError error={error} />;
  }

  return <ErrorPage error={error} />;
}

function FeedRoute() {
  const { id } = Route.useParams();
  const { mutate: markFeedViewed } = useMarkFeedViewed();

  useEffect(() => {
    markFeedViewed(id);
  }, [id, markFeedViewed]);

  return <FeedPage feedId={id} />;
}
