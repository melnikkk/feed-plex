import type { FC } from 'react';
import { Badge, Skeleton } from '@/shared/ui';

interface Props {
  isPending: boolean;
  isError: boolean;
  status: string | undefined;
}

export const ApiStatusBadge: FC<Props> = ({ isPending, isError, status }) => {
  if (isPending) {
    return <Skeleton className="h-5 w-16" />;
  }

  if (isError || !status) {
    return <Badge variant="destructive">unreachable</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-emerald-600/30 text-emerald-600 dark:text-emerald-400"
    >
      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
      {status}
    </Badge>
  );
};
