import type { FC } from 'react';
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
} from '@/shared/ui';

interface Props {
  feedId: string;
  feedName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteFeedDialog: FC<Props> = ({ feedId, feedName, open, onOpenChange }) => {
  const deleteFeedMutation = useDeleteFeed();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
              onOpenChange(false);
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
