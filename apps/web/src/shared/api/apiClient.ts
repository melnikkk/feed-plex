import { env } from '@/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    path: string,
    public readonly body?: unknown,
  ) {
    super(`Request to ${path} failed with status ${status}`);
  }
}

export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${env.VITE_API_URL}${path}`, init);

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);

    throw new ApiError(response.status, path, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
