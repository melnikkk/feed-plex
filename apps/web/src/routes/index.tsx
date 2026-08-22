import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getHealth } from '@/lib/apiClient';

export const Route = createFileRoute('/')({
  component: IndexRoute,
});

function IndexRoute() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  return (
    <main>
      <h1>FeedPlex</h1>
      <p>API status: {isPending ? 'checking…' : isError ? 'unreachable' : data.status}</p>
    </main>
  );
}
