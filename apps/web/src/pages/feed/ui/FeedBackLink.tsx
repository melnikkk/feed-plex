import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';

export const FeedBackLink: FC = () => (
  <Link
    to="/feeds"
    className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="size-3.5" />
    All feeds
  </Link>
);
