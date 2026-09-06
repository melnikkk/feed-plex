import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import {
  emptyFeedInterest,
  emptyFeedSource,
  feedFormSchema,
  type FeedFormValues,
} from '@/features/manageFeed/model/feedForm';
import {
  Button,
  DialogClose,
  DialogFooter,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Textarea,
} from '@/shared/ui';
import { FeedInterestRow } from './FeedInterestRow';
import { FeedSourceRow } from './FeedSourceRow';

interface Props {
  defaultValues: FeedFormValues;
  submitLabel: string;
  submittingLabel: string;
  errorMessage: string | null;
  onSubmit: (values: FeedFormValues) => Promise<void>;
  children?: ReactNode;
}

export const FeedForm: FC<Props> = ({
  defaultValues,
  submitLabel,
  submittingLabel,
  errorMessage,
  onSubmit,
  children,
}) => {
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: feedFormSchema },
    onSubmit: ({ value }) => onSubmit(value).catch(() => undefined),
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="max-h-[60vh] gap-6 overflow-y-auto px-1">
        <form.Field name="name">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="Frontend weekly"
                aria-invalid={field.state.meta.errors.length > 0 || undefined}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                id={field.name}
                rows={2}
                value={field.state.value}
                placeholder="Optional"
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="sources" mode="array">
          {(sourcesField) => (
            <FieldSet>
              <FieldLegend variant="label">Sources</FieldLegend>
              <FieldDescription>RSS, Atom, sitemap, or archive page URLs.</FieldDescription>
              <FieldGroup className="gap-3">
                {sourcesField.state.value.map((_, index) => (
                  // The row is fully controlled and the form store is addressed by index, so the
                  // key must track the index it reads from — a stable id would desync the two.
                  // oxlint-disable-next-line react/no-array-index-key
                  <form.Field key={index} name={`sources[${index}].url`}>
                    {(field) => (
                      <FeedSourceRow
                        id={field.name}
                        value={field.state.value}
                        errors={field.state.meta.errors}
                        canRemove={sourcesField.state.value.length > 1}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        onRemove={() => sourcesField.removeValue(index)}
                      />
                    )}
                  </form.Field>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => sourcesField.pushValue(emptyFeedSource)}
                >
                  <Plus data-icon="inline-start" />
                  Add source
                </Button>
              </FieldGroup>
            </FieldSet>
          )}
        </form.Field>

        <form.Field name="interests" mode="array">
          {(interestsField) => (
            <FieldSet>
              <FieldLegend variant="label">Interests</FieldLegend>
              <FieldDescription>Topics articles are ranked against.</FieldDescription>
              <FieldGroup className="gap-3">
                {interestsField.state.value.map((_, index) => (
                  // oxlint-disable-next-line react/no-array-index-key
                  <form.Field key={index} name={`interests[${index}].topic`}>
                    {(topicField) => (
                      <form.Field name={`interests[${index}].keywords`}>
                        {(keywordsField) => (
                          <FeedInterestRow
                            topicId={topicField.name}
                            keywordsId={keywordsField.name}
                            topic={topicField.state.value}
                            keywords={keywordsField.state.value}
                            topicErrors={topicField.state.meta.errors}
                            canRemove={interestsField.state.value.length > 1}
                            onTopicChange={topicField.handleChange}
                            onTopicBlur={topicField.handleBlur}
                            onKeywordsChange={keywordsField.handleChange}
                            onRemove={() => interestsField.removeValue(index)}
                          />
                        )}
                      </form.Field>
                    )}
                  </form.Field>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => interestsField.pushValue(emptyFeedInterest)}
                >
                  <Plus data-icon="inline-start" />
                  Add interest
                </Button>
              </FieldGroup>
            </FieldSet>
          )}
        </form.Field>

        {children}

        {errorMessage && <FieldError>{errorMessage}</FieldError>}
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
