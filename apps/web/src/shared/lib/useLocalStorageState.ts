import { useCallback, useState } from 'react';

const read = <T extends string>(key: string, allowedValues: ReadonlyArray<T>): T | undefined => {
  try {
    const stored = window.localStorage.getItem(key);

    return allowedValues.find((allowed) => allowed === stored);
  } catch {
    return undefined;
  }
};

/**
 * Persisted string-union state. Falls back to `fallback` whenever storage is
 * unavailable (private browsing) or holds a value no longer in the union.
 */
export const useLocalStorageState = <T extends string>(
  key: string,
  allowedValues: ReadonlyArray<T>,
  fallback: T,
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => read(key, allowedValues) ?? fallback);

  const persist = useCallback(
    (next: T) => {
      setValue(next);

      try {
        window.localStorage.setItem(key, next);
      } catch {
        /* storage unavailable — keep the in-memory value */
      }
    },
    [key],
  );

  return [value, persist];
};
