import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/shared/api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui';

export function HomePage() {
  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['health'],
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
            {isPending ? (
              <Skeleton className="h-5 w-16" />
            ) : isError ? (
              <Badge variant="destructive">unreachable</Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-600/30 text-emerald-600 dark:text-emerald-400"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {data.status}
              </Badge>
            )}
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
}
