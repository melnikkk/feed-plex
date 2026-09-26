import { Link } from '@tanstack/react-router';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';
import { cn } from '@/shared/lib';
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
  reason: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const FeedErrorState: FC<Props> = ({ reason, isRetrying, onRetry }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TriangleAlert />
      </EmptyMedia>
      <EmptyTitle>Couldn't load this feed</EmptyTitle>
      <EmptyDescription>{reason}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent className="flex-row justify-center">
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        <RefreshCw data-icon="inline-start" className={cn(isRetrying && 'animate-spin')} />
        Try again
      </Button>
      <Button variant="ghost" render={<Link to="/feeds" />}>
        Back to feeds
      </Button>
    </EmptyContent>
  </Empty>
);
