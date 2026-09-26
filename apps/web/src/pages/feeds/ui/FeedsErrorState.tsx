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

export const FeedsErrorState: FC<Props> = ({ reason, isRetrying, onRetry }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TriangleAlert />
      </EmptyMedia>
      <EmptyTitle>Couldn't load feeds</EmptyTitle>
      <EmptyDescription>{reason}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        <RefreshCw data-icon="inline-start" className={cn(isRetrying && 'animate-spin')} />
        Try again
      </Button>
    </EmptyContent>
  </Empty>
);
