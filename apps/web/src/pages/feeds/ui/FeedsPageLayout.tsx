import type { FC, ReactNode } from 'react';
import { FeedsPageHeader } from './FeedsPageHeader';

interface Props {
  feedCount: number;
  children: ReactNode;
}

export const FeedsPageLayout: FC<Props> = ({ feedCount, children }) => (
  <main className="min-h-screen">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-16 pb-12">
      <FeedsPageHeader feedCount={feedCount} />
      {children}
    </div>
  </main>
);
