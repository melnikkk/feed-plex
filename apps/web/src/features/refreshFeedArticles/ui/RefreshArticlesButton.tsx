import { RefreshCw } from 'lucide-react';
import type { FC } from 'react';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';

interface Props {
  isRunning: boolean;
  onRefresh: () => void;
}

export const RefreshArticlesButton: FC<Props> = ({ isRunning, onRefresh }) => (
  <Button variant="outline" onClick={onRefresh} disabled={isRunning}>
    <RefreshCw data-icon="inline-start" className={cn(isRunning && 'animate-spin')} />
    {isRunning ? 'Ranking…' : 'Refresh'}
  </Button>
);
