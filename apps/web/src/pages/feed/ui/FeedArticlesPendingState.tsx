import { Loader } from 'lucide-react';
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

export const FeedArticlesPendingState: FC<Props> = ({ isRunning, onRefresh }) => (
  <Empty className="border border-dashed py-16">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Loader />
      </EmptyMedia>
      <EmptyTitle>Ranking in progress</EmptyTitle>
      <EmptyDescription>
        The first run hasn't finished yet. This usually takes about a minute.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <RefreshArticlesButton isRunning={isRunning} onRefresh={onRefresh} />
    </EmptyContent>
  </Empty>
);
