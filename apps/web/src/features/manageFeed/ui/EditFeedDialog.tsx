import type { Feed } from '@feed-plex/contracts';
import type { FC } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui';
import { EditFeedForm } from './EditFeedForm';

interface Props {
  feed: Feed;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditFeedDialog: FC<Props> = ({ feed, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit feed</DialogTitle>
        <DialogDescription>
          Change the sources to ingest and the interests to rank articles against.
        </DialogDescription>
      </DialogHeader>
      <EditFeedForm key={feed.updatedAt} feed={feed} onSaved={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
