import type { FC } from 'react';
import { REFRESH_INTERVAL_OPTIONS } from '@/entities/feed';
import { toRefreshIntervalValue } from '@/features/manageFeed/model/feedForm';
import {
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

const items = REFRESH_INTERVAL_OPTIONS.map(({ hours, label }) => ({
  value: toRefreshIntervalValue(hours),
  label,
}));

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export const FeedRefreshIntervalField: FC<Props> = ({ id, value, onChange }) => (
  <Field>
    <FieldLabel htmlFor={id}>Auto-refresh</FieldLabel>
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next);
        }
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FieldDescription>
      How often articles are re-ranked automatically. Refreshes missed while FeedPlex was stopped
      run when it starts again.
    </FieldDescription>
  </Field>
);
