import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router';
import { feedsQueryOptions } from '@/entities/feed';
import { ErrorPage } from '@/pages/error';
import { FeedsPage, FeedsPageError, FeedsPagePending } from '@/pages/feeds';
import { isRequestError } from '@/shared/api';

export const Route = createFileRoute('/feeds/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedsQueryOptions()),
  pendingComponent: FeedsPagePending,
  errorComponent: FeedsRouteError,
  component: FeedsPage,
});

function FeedsRouteError({ error }: ErrorComponentProps) {
  if (isRequestError(error)) {
    return <FeedsPageError error={error} />;
  }

  return <ErrorPage error={error} />;
}
