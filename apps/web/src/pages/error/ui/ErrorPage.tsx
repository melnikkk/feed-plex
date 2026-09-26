import { Link } from '@tanstack/react-router';
import { RefreshCw, RotateCw, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';
import { getErrorReason } from '@/shared/api';
import { cn, useRouteRetry } from '@/shared/lib';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui';

interface Props {
  error: Error;
}

export const ErrorPage: FC<Props> = ({ error }) => {
  const { retry, isRetrying } = useRouteRetry();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Empty className="w-full max-w-md border border-dashed py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>{getErrorReason(error)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center">
          <Button onClick={() => void retry()} disabled={isRetrying}>
            <RefreshCw data-icon="inline-start" className={cn(isRetrying && 'animate-spin')} />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCw data-icon="inline-start" />
            Reload page
          </Button>
          <Button variant="ghost" render={<Link to="/feeds" />}>
            Back to feeds
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
};
