import type { RefreshIntervalHours } from '@feed-plex/contracts';

interface RefreshIntervalOption {
  hours: RefreshIntervalHours;
  label: string;
}

export const REFRESH_INTERVAL_OPTIONS: Array<RefreshIntervalOption> = [
  { hours: null, label: 'Off' },
  { hours: 6, label: 'Every 6 hours' },
  { hours: 12, label: 'Every 12 hours' },
  { hours: 24, label: 'Daily' },
  { hours: 168, label: 'Weekly' },
];

export const formatRefreshInterval = (hours: RefreshIntervalHours): string =>
  REFRESH_INTERVAL_OPTIONS.find((option) => option.hours === hours)?.label ?? 'Off';
