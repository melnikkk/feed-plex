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
  search: string;
  onClearSearch: () => void;
}

export const FeedsNoResultsState: FC<Props> = ({ search, onClearSearch }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No feeds match "{search}"</EmptyTitle>
      <EmptyDescription>Try a different name, topic or source URL.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" onClick={onClearSearch}>
        Clear search
      </Button>
    </EmptyContent>
  </Empty>
);
