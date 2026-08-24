import { X } from 'lucide-react';
import type { FC } from 'react';
import { Button, Field, FieldError, Input } from '@/shared/ui';

interface Props {
  id: string;
  value: string;
  errors: Array<{ message?: string } | undefined>;
  canRemove: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onRemove: () => void;
}

export const CreateFeedSourceRow: FC<Props> = ({
  id,
  value,
  errors,
  canRemove,
  onChange,
  onBlur,
  onRemove,
}) => {
  const isInvalid = errors.length > 0;

  return (
    <Field data-invalid={isInvalid || undefined}>
      <div className="flex items-start gap-2">
        <Input
          id={id}
          value={value}
          placeholder="https://example.com/feed.xml"
          aria-label="Source URL"
          aria-invalid={isInvalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove source"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <X />
        </Button>
      </div>
      <FieldError errors={errors} />
    </Field>
  );
};
