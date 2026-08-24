import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { getHealth, healthKeys } from '@/shared/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';
import { ApiStatusBadge } from './ApiStatusBadge';

export const HomePage: FC = () => {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: healthKeys.all,
    queryFn: getHealth,
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>FeedPlex</CardTitle>
          <CardDescription>Personal feed intelligence, self-hosted.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">API</span>
            <ApiStatusBadge isPending={isPending} isError={isError} status={data?.status} />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
