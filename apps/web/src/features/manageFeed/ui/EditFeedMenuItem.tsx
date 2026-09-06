import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { DropdownMenuItem } from '@/shared/ui';

interface Props {
  onSelect: () => void;
}

export const EditFeedMenuItem: FC<Props> = ({ onSelect }) => (
  <DropdownMenuItem onClick={onSelect}>
    <Pencil />
    Edit
  </DropdownMenuItem>
);
