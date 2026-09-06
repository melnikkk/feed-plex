import type { Feed } from '@feed-plex/contracts';
import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/shared/ui';
import { EditFeedDialog } from './EditFeedDialog';

interface Props {
  feed: Feed;
}

export const EditFeedButton: FC<Props> = ({ feed }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Pencil data-icon="inline-start" />
        Edit
      </Button>
      <EditFeedDialog feed={feed} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
