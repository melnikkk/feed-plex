import type { DbClient } from '@feed-plex/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REFRESH_CLAIM_BATCH_SIZE, SCHEDULED_RUN_JOB_OPTIONS } from '@/scheduler/constants';
import { runRefreshSweep } from '@/scheduler/refreshSweep';

const { claimDueFeedsMock } = vi.hoisted(() => ({ claimDueFeedsMock: vi.fn() }));

vi.mock('@feed-plex/database', () => ({ claimDueFeeds: claimDueFeedsMock }));

vi.mock('@/logger', () => ({ logger: { info: vi.fn() } }));

const db = {} as DbClient;

describe('runRefreshSweep', () => {
  beforeEach(() => {
    claimDueFeedsMock.mockReset();
  });

  it('queues one scheduled run per claimed feed', async () => {
    claimDueFeedsMock.mockResolvedValue(['feed-1', 'feed-2']);
    const queue = { addBulk: vi.fn().mockResolvedValue([]) };

    const queued = await runRefreshSweep(db, queue);

    expect(queued).toBe(2);
    expect(claimDueFeedsMock).toHaveBeenCalledOnce();
    expect(claimDueFeedsMock).toHaveBeenCalledWith(db, REFRESH_CLAIM_BATCH_SIZE);
    expect(queue.addBulk).toHaveBeenCalledWith([
      { name: 'run', data: { feedId: 'feed-1' }, opts: SCHEDULED_RUN_JOB_OPTIONS },
      { name: 'run', data: { feedId: 'feed-2' }, opts: SCHEDULED_RUN_JOB_OPTIONS },
    ]);
  });

  it('keeps claiming batches until one comes back short', async () => {
    const fullBatch = Array.from(
      { length: REFRESH_CLAIM_BATCH_SIZE },
      (_, index) => `feed-${index}`,
    );
    claimDueFeedsMock.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce(['feed-last']);
    const queue = { addBulk: vi.fn().mockResolvedValue([]) };

    const queued = await runRefreshSweep(db, queue);

    expect(queued).toBe(REFRESH_CLAIM_BATCH_SIZE + 1);
    expect(claimDueFeedsMock).toHaveBeenCalledTimes(2);
    expect(queue.addBulk).toHaveBeenCalledTimes(2);
  });

  it('queues nothing when no feed is due', async () => {
    claimDueFeedsMock.mockResolvedValue([]);
    const queue = { addBulk: vi.fn() };

    const queued = await runRefreshSweep(db, queue);

    expect(queued).toBe(0);
    expect(queue.addBulk).not.toHaveBeenCalled();
  });

  it('propagates a claim failure so BullMQ records the sweep as failed', async () => {
    claimDueFeedsMock.mockRejectedValue(new Error('db down'));
    const queue = { addBulk: vi.fn() };

    await expect(runRefreshSweep(db, queue)).rejects.toThrow('db down');
    expect(queue.addBulk).not.toHaveBeenCalled();
  });
});
