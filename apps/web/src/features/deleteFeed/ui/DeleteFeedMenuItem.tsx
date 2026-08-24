import type { FC } from 'react';
import { useState } from 'react';
import { useDeleteFeed } from '@/features/deleteFeed/model/useDeleteFeed';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  DropdownMenuItem,
} from '@/shared/ui';

interface Props {
  feedId: string;
  feedName: string;
}

export const DeleteFeedMenuItem: FC<Props> = ({ feedId, feedName }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteFeedMutation = useDeleteFeed();

  return (
    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
      <AlertDialogTrigger render={<DropdownMenuItem variant="destructive" />} nativeButton={false}>
        {deleteFeedMutation.isPending ? 'Deleting…' : 'Delete'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this feed?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes "{feedName}" and its sources and interests. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setIsConfirmOpen(false);
              deleteFeedMutation.mutate(feedId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
