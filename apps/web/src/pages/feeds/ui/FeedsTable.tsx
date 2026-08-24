import type { Feed } from '@feed-plex/contracts';
import type { FC } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui';
import { FeedsTableRow } from './FeedsTableRow';

interface Props {
  feeds: Array<Feed>;
}

export const FeedsTable: FC<Props> = ({ feeds }) => (
  <div className="w-full overflow-x-auto border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feed</TableHead>
          <TableHead className="w-24">Sources</TableHead>
          <TableHead className="w-64">Interests</TableHead>
          <TableHead className="w-40">Updated</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feeds.map((feed) => (
          <FeedsTableRow key={feed.id} feed={feed} />
        ))}
      </TableBody>
    </Table>
  </div>
);
