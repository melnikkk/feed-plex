import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const FeedPageLayout: FC<Props> = ({ children }) => (
  <main className="min-h-screen">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-16 pb-12">{children}</div>
  </main>
);
