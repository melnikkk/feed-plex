import { createFileRoute } from '@tanstack/react-router';
import { feedsQueryOptions } from '@/entities/feed';
import { FeedsPage } from '@/pages/feeds';

export const Route = createFileRoute('/feeds/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedsQueryOptions()),
  component: FeedsPage,
});
