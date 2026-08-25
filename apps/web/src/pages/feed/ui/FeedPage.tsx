import { CatchBoundary } from '@tanstack/react-router';
import type { FC } from 'react';
import { Suspense } from 'react';
import { FeedPageContent } from './FeedPageContent';
import { FeedPageErrorState } from './FeedPageErrorState';
import { FeedPageSkeleton } from './FeedPageSkeleton';

interface Props {
  feedId: string;
}

export const FeedPage: FC<Props> = ({ feedId }) => (
  <main className="min-h-screen">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-16 pb-12">
      <CatchBoundary getResetKey={() => feedId} errorComponent={FeedPageErrorState}>
        <Suspense fallback={<FeedPageSkeleton />}>
          <FeedPageContent feedId={feedId} />
        </Suspense>
      </CatchBoundary>
    </div>
  </main>
);
