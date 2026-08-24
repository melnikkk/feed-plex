import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

export const WorkInProgressPage: FC = () => {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>This page is still under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link to="/feeds" />}>
            Back to feeds
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};
