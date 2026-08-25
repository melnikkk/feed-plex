import { CatchBoundary } from '@tanstack/react-router';
import type { FC } from 'react';
import { Suspense } from 'react';
import { useFeedsView } from '@/pages/feeds/model/useFeedsView';
import { FeedsErrorState } from './FeedsErrorState';
import { FeedsLoadingState } from './FeedsLoadingState';
import { FeedsPageContent } from './FeedsPageContent';

export const FeedsPage: FC = () => {
  const [view, setView] = useFeedsView();

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-16 pb-12">
        <CatchBoundary getResetKey={() => 'feeds'} errorComponent={FeedsErrorState}>
          <Suspense fallback={<FeedsLoadingState view={view} />}>
            <FeedsPageContent view={view} onViewChange={setView} />
          </Suspense>
        </CatchBoundary>
      </div>
    </main>
  );
};
