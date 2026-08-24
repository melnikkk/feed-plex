import { createFileRoute } from '@tanstack/react-router';
import { WorkInProgressPage } from '@/pages/workInProgress';

export const Route = createFileRoute('/feeds/create')({
  component: WorkInProgressPage,
});
