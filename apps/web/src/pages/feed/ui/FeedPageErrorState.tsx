import { useQueryClient } from '@tanstack/react-query';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';
import { feedKeys } from '@/entities/feed';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui';

export const FeedPageErrorState: FC<ErrorComponentProps> = ({ reset }) => {
  const queryClient = useQueryClient();

  const retry = () => {
    void queryClient.resetQueries({ queryKey: feedKeys.all });
    reset();
  };

  return (
    <Empty className="border border-dashed py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Couldn't load this feed</EmptyTitle>
        <EmptyDescription>Something went wrong reaching the API.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={retry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
};
