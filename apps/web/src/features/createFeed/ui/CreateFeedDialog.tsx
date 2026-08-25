import { Plus } from 'lucide-react';
import type { FC } from 'react';
import { Suspense, lazy, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { CreateFeedFormSkeleton } from './CreateFeedFormSkeleton';

const CreateFeedForm = lazy(() => import('./CreateFeedForm'));

export const CreateFeedDialog: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Add feed
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New feed</DialogTitle>
          <DialogDescription>
            Add the sources to ingest and the interests to rank articles against.
          </DialogDescription>
        </DialogHeader>
        <Suspense fallback={<CreateFeedFormSkeleton />}>
          <CreateFeedForm onCreated={() => setIsOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
