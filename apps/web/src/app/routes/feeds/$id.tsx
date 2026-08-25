import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { feedArticlesQueryOptions } from '@/entities/article';
import { feedQueryOptions } from '@/entities/feed';
import { useMarkFeedViewed } from '@/features/markFeedViewed';
import { FeedPage } from '@/pages/feed';
import { ApiError } from '@/shared/api';

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
  component: FeedRoute,
});

function FeedRoute() {
  const { id } = Route.useParams();
  const { data: feed } = useQuery(feedQueryOptions(id));
  const { mutate: markFeedViewed } = useMarkFeedViewed();

  useEffect(() => {
    markFeedViewed(id);
  }, [id, markFeedViewed]);

  if (!feed) {
    return null;
  }

  return <FeedPage feedId={id} />;
}
