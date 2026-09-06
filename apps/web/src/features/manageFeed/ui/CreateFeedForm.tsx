import type { FC } from 'react';
import { feedErrorMessage } from '@/features/manageFeed/model/feedErrorMessage';
import {
  emptyFeedForm,
  type FeedFormValues,
  toCreateFeedInput,
} from '@/features/manageFeed/model/feedForm';
import { useCreateFeed } from '@/features/manageFeed/model/useCreateFeed';
import { toast } from '@/shared/ui';
import { FeedForm } from './FeedForm';

interface Props {
  onCreated: () => void;
}

export const CreateFeedForm: FC<Props> = ({ onCreated }) => {
  const createFeedMutation = useCreateFeed();

  const handleSubmit = async (values: FeedFormValues) => {
    const feed = await createFeedMutation.mutateAsync(toCreateFeedInput(values));

    toast.add({ title: 'Feed created', description: feed.name });
    onCreated();
  };

  return (
    <FeedForm
      defaultValues={emptyFeedForm}
      submitLabel="Create feed"
      submittingLabel="Creating…"
      errorMessage={
        createFeedMutation.isError ? feedErrorMessage(createFeedMutation.error, 'create') : null
      }
      onSubmit={handleSubmit}
    />
  );
};
