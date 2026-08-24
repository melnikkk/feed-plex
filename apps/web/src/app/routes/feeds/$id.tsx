import { useQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { feedQueryOptions } from '@/entities/feed';
import { useMarkFeedViewed } from '@/features/markFeedViewed';
import { WorkInProgressPage } from '@/pages/workInProgress';
import { ApiError } from '@/shared/api';

export const Route = createFileRoute('/feeds/$id')({
  loader: async ({ params, context }) => {
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

  return <WorkInProgressPage />;
}
