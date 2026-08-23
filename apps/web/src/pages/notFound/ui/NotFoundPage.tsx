import { Link } from '@tanstack/react-router';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>404</CardTitle>
          <CardDescription>This page doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link to="/" />}>
            Back to home
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
