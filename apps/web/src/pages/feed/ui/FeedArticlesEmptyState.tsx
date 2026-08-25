import { Inbox } from 'lucide-react';
import type { FC } from 'react';
import { RefreshArticlesButton } from '@/features/refreshFeedArticles';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui';

interface Props {
  isRunning: boolean;
  onRefresh: () => void;
}

export const FeedArticlesEmptyState: FC<Props> = ({ isRunning, onRefresh }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Inbox />
      </EmptyMedia>
      <EmptyTitle>Nothing cleared the bar</EmptyTitle>
      <EmptyDescription>
        No article from the last 7 days scored above the relevance threshold. Try broadening the
        feed's interests or adding another source.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <RefreshArticlesButton isRunning={isRunning} onRefresh={onRefresh} />
    </EmptyContent>
  </Empty>
);
