import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from '@/lib/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('requests the health endpoint from the configured API URL', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    );

    const result = await getHealth();

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/health');
    expect(result).toEqual({ status: 'ok' });
  });

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getHealth()).rejects.toThrow('Request to /health failed with status 500');
  });
});
