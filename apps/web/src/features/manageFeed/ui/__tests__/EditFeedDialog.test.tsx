import type { Feed, UpdateFeedInput } from '@feed-plex/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditFeedDialog } from '@/features/manageFeed';
import type * as SharedApi from '@/shared/api';
import { ApiError } from '@/shared/api';

const updateFeed = vi.fn<(feedId: string, input: UpdateFeedInput) => Promise<Feed>>();
const createFeedRun = vi.fn<(feedId: string) => Promise<{ jobId: string }>>();

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedApi>()),
  updateFeed: (feedId: string, input: UpdateFeedInput) => updateFeed(feedId, input),
  createFeedRun: (feedId: string) => createFeedRun(feedId),
}));

const feed: Feed = {
  id: 'feed-1',
  name: 'Frontend weekly',
  description: 'Weekly frontend reading',
  sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 0.25 }],
  interests: [{ topic: 'react', weight: 0.9, keywords: ['hooks', 'rsc'] }],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

const renderDialog = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <EditFeedDialog feed={feed} open onOpenChange={() => undefined} />
    </QueryClientProvider>,
  );

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Save feed' }));

const regenerateCheckbox = () => screen.getByRole('checkbox', { name: /Regenerate feed/ });

describe('EditFeedDialog', () => {
  beforeEach(() => {
    updateFeed.mockReset();
    createFeedRun.mockReset();
    updateFeed.mockResolvedValue(feed);
    createFeedRun.mockResolvedValue({ jobId: 'job-1' });
  });

  it('prefills every field from the feed', async () => {
    renderDialog();

    await screen.findByRole('dialog');

    expect(screen.getByLabelText('Name')).toHaveValue('Frontend weekly');
    expect(screen.getByLabelText('Description')).toHaveValue('Weekly frontend reading');
    expect(screen.getByLabelText('Source URL')).toHaveValue('https://example.com/feed.xml');
    expect(screen.getByLabelText('Interest topic')).toHaveValue('react');
    expect(screen.getByLabelText('Interest keywords')).toHaveValue('hooks, rsc');
  });

  it('sends the edited payload and preserves the stored affinity and weight', async () => {
    renderDialog();
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Frontend daily' } });
    submit();

    await waitFor(() => expect(updateFeed).toHaveBeenCalledTimes(1));
    expect(updateFeed).toHaveBeenCalledWith('feed-1', {
      name: 'Frontend daily',
      description: 'Weekly frontend reading',
      sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 0.25 }],
      interests: [{ topic: 'react', weight: 0.9, keywords: ['hooks', 'rsc'] }],
    });
  });

  it('sends an empty description when the user clears it', async () => {
    renderDialog();
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '' } });
    submit();

    await waitFor(() => expect(updateFeed).toHaveBeenCalledTimes(1));
    expect(updateFeed.mock.calls[0]?.[1].description).toBe('');
  });

  it('regenerates the feed by default', async () => {
    renderDialog();
    await screen.findByRole('dialog');

    expect(regenerateCheckbox()).toBeChecked();

    submit();

    await waitFor(() => expect(createFeedRun).toHaveBeenCalledWith('feed-1'));
  });

  it('still saves but starts no run once the checkbox is cleared', async () => {
    renderDialog();
    await screen.findByRole('dialog');

    fireEvent.click(regenerateCheckbox());

    await waitFor(() => expect(regenerateCheckbox()).not.toBeChecked());

    submit();

    await waitFor(() => expect(updateFeed).toHaveBeenCalledTimes(1));
    expect(createFeedRun).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and shows a readable message when the name is taken', async () => {
    updateFeed.mockRejectedValue(
      new ApiError(409, '/feeds/feed-1', { error: 'A feed with this name already exists.' }),
    );
    renderDialog();
    await screen.findByRole('dialog');

    submit();

    expect(await screen.findByText('A feed with this name already exists.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('reports validation errors and sends no request', async () => {
    renderDialog();
    await screen.findByRole('dialog');

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  ' } });
    submit();

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(updateFeed).not.toHaveBeenCalled();
  });
});
