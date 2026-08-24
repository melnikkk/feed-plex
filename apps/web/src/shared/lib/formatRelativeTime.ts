const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const thresholds: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * DAY],
  ['month', 30 * DAY],
  ['week', 7 * DAY],
  ['day', DAY],
  ['hour', HOUR],
  ['minute', MINUTE],
];

export const formatRelativeTime = (isoDate: string): string => {
  const timestamp = Date.parse(isoDate);

  if (Number.isNaN(timestamp)) {
    return 'unknown';
  }

  const elapsed = timestamp - Date.now();
  const threshold = thresholds.find(([, size]) => Math.abs(elapsed) >= size);

  if (!threshold) {
    return relativeTimeFormat.format(0, 'second');
  }

  const [unit, size] = threshold;

  return relativeTimeFormat.format(Math.round(elapsed / size), unit);
};
