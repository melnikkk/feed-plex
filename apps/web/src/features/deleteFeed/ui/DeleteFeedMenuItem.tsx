import { Trash2 } from 'lucide-react';
import type { FC } from 'react';
import { DropdownMenuItem } from '@/shared/ui';

interface Props {
  onSelect: () => void;
}

export const DeleteFeedMenuItem: FC<Props> = ({ onSelect }) => (
  <DropdownMenuItem variant="destructive" onClick={onSelect}>
    <Trash2 />
    Delete
  </DropdownMenuItem>
);
