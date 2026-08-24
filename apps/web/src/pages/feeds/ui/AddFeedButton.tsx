import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import type { FC } from 'react';
import { Button } from '@/shared/ui';

export const AddFeedButton: FC = () => (
  <Button render={<Link to="/feeds/create" />}>
    <Plus data-icon="inline-start" />
    Add feed
  </Button>
);
