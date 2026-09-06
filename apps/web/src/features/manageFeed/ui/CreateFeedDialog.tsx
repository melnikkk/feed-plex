import { Plus } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { CreateFeedForm } from './CreateFeedForm';

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
        <CreateFeedForm onCreated={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
