import { Rss } from 'lucide-react';
import type { FC } from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui';
import { AddFeedButton } from './AddFeedButton';

export const FeedsEmptyState: FC = () => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Rss />
      </EmptyMedia>
      <EmptyTitle>No feeds yet</EmptyTitle>
      <EmptyDescription>
        Create your first feed to start ingesting sources and ranking articles.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <AddFeedButton />
    </EmptyContent>
  </Empty>
);
