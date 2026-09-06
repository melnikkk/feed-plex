import type { Feed } from '@feed-plex/contracts';
import type { FC } from 'react';
import { useState } from 'react';
import { feedErrorMessage } from '@/features/manageFeed/model/feedErrorMessage';
import {
  type FeedFormValues,
  toFeedFormValues,
  toUpdateFeedInput,
} from '@/features/manageFeed/model/feedForm';
import { useUpdateFeed } from '@/features/manageFeed/model/useUpdateFeed';
import { Checkbox, Field, FieldContent, FieldDescription, FieldLabel, toast } from '@/shared/ui';
import { FeedForm } from './FeedForm';

interface Props {
  feed: Feed;
  onSaved: () => void;
}

export const EditFeedForm: FC<Props> = ({ feed, onSaved }) => {
  const updateFeedMutation = useUpdateFeed();
  const [shouldRegenerate, setShouldRegenerate] = useState(true);

  const handleSubmit = async (values: FeedFormValues) => {
    const saved = await updateFeedMutation.mutateAsync({
      feedId: feed.id,
      input: toUpdateFeedInput(values, feed),
      regenerate: shouldRegenerate,
    });

    toast.add({ title: 'Feed saved', description: saved.name });
    onSaved();
  };

  return (
    <FeedForm
      defaultValues={toFeedFormValues(feed)}
      submitLabel="Save feed"
      submittingLabel="Saving…"
      errorMessage={
        updateFeedMutation.isError ? feedErrorMessage(updateFeedMutation.error, 'save') : null
      }
      onSubmit={handleSubmit}
    >
      <Field orientation="horizontal">
        <Checkbox
          id="regenerate-feed"
          checked={shouldRegenerate}
          onCheckedChange={setShouldRegenerate}
        />
        <FieldContent>
          <FieldLabel htmlFor="regenerate-feed" className="font-normal">
            Regenerate feed after save
          </FieldLabel>
          <FieldDescription>
            Re-rank articles against the updated sources and interests.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FeedForm>
  );
};
