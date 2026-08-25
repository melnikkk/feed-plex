import type { Source } from '@feed-plex/contracts';
import type { FC } from 'react';
import { ALL_SOURCES, isArticleSortOption, type ArticleSortOption } from '@/entities/article';
import { articleHostname } from '@/entities/article';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

const sortLabels: Record<ArticleSortOption, string> = {
  relevance: 'Most relevant',
  newest: 'Newest first',
};

interface Props {
  articleCount: number;
  sources: Array<Source>;
  sort: ArticleSortOption;
  onSortChange: (sort: ArticleSortOption) => void;
  source: string;
  onSourceChange: (source: string) => void;
}

const buildSourceLabels = (sources: Array<Source>): Record<string, string> =>
  Object.fromEntries([
    [ALL_SOURCES, 'All sources'],
    ...sources.map((source) => [
      source.url,
      articleHostname({ link: source.url, sourceUrl: source.url }),
    ]),
  ]);

export const FeedArticlesToolbar: FC<Props> = ({
  articleCount,
  sources,
  sort,
  onSortChange,
  source,
  onSourceChange,
}) => {
  const sourceLabels = buildSourceLabels(sources);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {articleCount} relevant {articleCount === 1 ? 'article' : 'articles'}
      </p>

      <div className="flex items-center gap-2">
        {sources.length > 1 && (
          <Select
            items={sourceLabels}
            value={source}
            onValueChange={(value) => onSourceChange(value ?? ALL_SOURCES)}
          >
            <SelectTrigger aria-label="Filter by source" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        <Select
          items={sortLabels}
          value={sort}
          onValueChange={(value) => {
            if (isArticleSortOption(value)) {
              onSortChange(value);
            }
          }}
        >
          <SelectTrigger aria-label="Sort articles" className="w-40">
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
      </div>
    </div>
  );
};
