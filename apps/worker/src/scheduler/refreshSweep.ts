import type { RelevantArticlesJobData } from '@feed-plex/contracts';
import { RELEVANT_ARTICLES_JOB_NAME } from '@feed-plex/contracts';
import type { DbClient } from '@feed-plex/database';
import { claimDueFeeds } from '@feed-plex/database';
import type { Queue } from 'bullmq';
import { logger } from '@/logger';
import { REFRESH_CLAIM_BATCH_SIZE, SCHEDULED_RUN_JOB_OPTIONS } from '@/scheduler/constants';

export const runRefreshSweep = async (
  db: DbClient,
  queue: Pick<Queue<RelevantArticlesJobData>, 'addBulk'>,
): Promise<number> => {
  let queued = 0;
  let feedIds: Array<string>;

  // Batches run sequentially on purpose: each claim is a short transaction, and a batch is only
  // enqueued after its claim commits.
  do {
    // oxlint-disable-next-line no-await-in-loop
    feedIds = await claimDueFeeds(db, REFRESH_CLAIM_BATCH_SIZE);

    if (feedIds.length > 0) {
      // oxlint-disable-next-line no-await-in-loop
      await queue.addBulk(
        feedIds.map((feedId) => ({
          name: RELEVANT_ARTICLES_JOB_NAME,
          data: { feedId },
          opts: SCHEDULED_RUN_JOB_OPTIONS,
        })),
      );
      queued += feedIds.length;
    }
  } while (feedIds.length === REFRESH_CLAIM_BATCH_SIZE);

  if (queued > 0) {
    logger.info(`Queued scheduled refresh for ${queued} feed(s)`);
  }

  return queued;
};
