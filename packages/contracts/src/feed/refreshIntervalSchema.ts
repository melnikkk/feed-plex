import { z } from 'zod';

export const REFRESH_INTERVAL_HOURS = [6, 12, 24, 168] as const;

export const DEFAULT_REFRESH_INTERVAL_HOURS = 24;

export const refreshIntervalHoursSchema = z.literal(REFRESH_INTERVAL_HOURS).nullable();

export type RefreshIntervalHours = z.infer<typeof refreshIntervalHoursSchema>;
