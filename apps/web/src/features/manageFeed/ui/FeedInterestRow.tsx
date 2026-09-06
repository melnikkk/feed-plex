import { X } from 'lucide-react';
import type { FC } from 'react';
import { Button, Field, FieldDescription, FieldError, Input } from '@/shared/ui';

interface Props {
  topicId: string;
  keywordsId: string;
  topic: string;
  keywords: string;
  topicErrors: Array<{ message?: string } | undefined>;
  canRemove: boolean;
  onTopicChange: (value: string) => void;
  onTopicBlur: () => void;
  onKeywordsChange: (value: string) => void;
  onRemove: () => void;
}

export const FeedInterestRow: FC<Props> = ({
  topicId,
  keywordsId,
  topic,
  keywords,
  topicErrors,
  canRemove,
  onTopicChange,
  onTopicBlur,
  onKeywordsChange,
  onRemove,
}) => {
  const isInvalid = topicErrors.length > 0;

  return (
    <Field data-invalid={isInvalid || undefined} className="rounded-none border border-dashed p-3">
      <div className="flex items-start gap-2">
        <Input
          id={topicId}
          value={topic}
          placeholder="Topic"
          aria-label="Interest topic"
          aria-invalid={isInvalid || undefined}
          onChange={(event) => onTopicChange(event.target.value)}
          onBlur={onTopicBlur}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove interest"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <X />
        </Button>
      </div>
      <FieldError errors={topicErrors} />
      <Input
        id={keywordsId}
        value={keywords}
        placeholder="Keywords"
        aria-label="Interest keywords"
        onChange={(event) => onKeywordsChange(event.target.value)}
      />
      <FieldDescription>Comma-separated, optional.</FieldDescription>
    </Field>
  );
};
