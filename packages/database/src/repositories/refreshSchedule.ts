import type { RefreshIntervalHours } from '@feed-plex/contracts';
import { type AnyColumn, type SQL, sql } from 'drizzle-orm';

/** Pushes each refresh up to 5% past its interval so feeds created together drift apart. */
const REFRESH_JITTER_RATIO = 0.05;

export const jitteredRefreshInterval = (hours: AnyColumn | number): SQL =>
  sql`make_interval(hours => ${hours}::integer) * (1 + random() * ${sql.raw(String(REFRESH_JITTER_RATIO))})`;

export const nextRefreshAfter = (
  anchor: SQL,
  refreshIntervalHours: RefreshIntervalHours,
): SQL | null =>
  refreshIntervalHours === null
    ? null
    : sql`${anchor} + ${jitteredRefreshInterval(refreshIntervalHours)}`;
