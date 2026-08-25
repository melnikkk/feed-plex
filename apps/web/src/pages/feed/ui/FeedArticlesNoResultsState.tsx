import { SearchX } from 'lucide-react';
import type { FC } from 'react';
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
  onClearFilters: () => void;
}

export const FeedArticlesNoResultsState: FC<Props> = ({ onClearFilters }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No articles from this source</EmptyTitle>
      <EmptyDescription>The current filter hides every ranked article.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" onClick={onClearFilters}>
        Clear filters
      </Button>
    </EmptyContent>
  </Empty>
);
