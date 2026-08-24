import { LayoutGrid, Rows3, Search, X } from 'lucide-react';
import type { FC } from 'react';
import { isFeedSortOption, type FeedSortOption } from '@/entities/feed';
import { isFeedsView, type FeedsView } from '@/pages/feeds/model/useFeedsView';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/ui';

const sortLabels: Record<FeedSortOption, string> = {
  recentlyUpdated: 'Recently updated',
  recentlyAdded: 'Recently added',
  name: 'Name (A–Z)',
};

interface Props {
  search: string;
  onSearchChange: (search: string) => void;
  sort: FeedSortOption;
  onSortChange: (sort: FeedSortOption) => void;
  view: FeedsView;
  onViewChange: (view: FeedsView) => void;
}

export const FeedsToolbar: FC<Props> = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <InputGroup className="sm:max-w-xs">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search name, topic or source"
        aria-label="Search feeds"
      />
      {search.length > 0 && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>

    <div className="flex items-center gap-2">
      <Select
        items={sortLabels}
        value={sort}
        onValueChange={(value) => {
          if (isFeedSortOption(value)) {
            onSortChange(value);
          }
        }}
      >
        <SelectTrigger aria-label="Sort feeds" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      <ToggleGroup
        variant="outline"
        spacing={0}
        aria-label="Feeds layout"
        value={[view]}
        onValueChange={([selected]) => {
          if (isFeedsView(selected)) {
            onViewChange(selected);
          }
        }}
      >
        <ToggleGroupItem value="table" aria-label="Table view">
          <Rows3 />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <LayoutGrid />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
);
