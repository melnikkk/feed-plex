import type { CreateFeedInput, Feed } from '@feed-plex/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFeedDialog } from '@/features/createFeed';
import type * as SharedApi from '@/shared/api';
import { ApiError } from '@/shared/api';

const createFeed = vi.fn<(input: CreateFeedInput) => Promise<Feed>>();

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedApi>()),
  createFeed: (input: CreateFeedInput) => createFeed(input),
}));

const createdFeed: Feed = {
  id: 'feed-1',
  name: 'Frontend weekly',
  sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 1 }],
  interests: [{ topic: 'react', weight: 0.5, keywords: ['hooks'] }],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const renderDialog = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CreateFeedDialog />
    </QueryClientProvider>,
  );

const openDialog = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Add feed' }));

  const dialog = await screen.findByRole('dialog');

  await screen.findByLabelText('Name');

  return dialog;
};

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Frontend weekly' } });
  fireEvent.change(screen.getByLabelText('Source URL'), {
    target: { value: 'https://example.com/feed.xml' },
  });
  fireEvent.change(screen.getByLabelText('Interest topic'), { target: { value: 'react' } });
  fireEvent.change(screen.getByLabelText('Interest keywords'), { target: { value: 'hooks' } });
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Create feed' }));

describe('CreateFeedDialog', () => {
  beforeEach(() => {
    createFeed.mockReset();
  });

  it('opens the dialog from the trigger', async () => {
    renderDialog();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await openDialog();

    expect(screen.getByText('New feed')).toBeInTheDocument();
  });

  it('reports validation errors and sends no request when the form is empty', async () => {
    renderDialog();
    await openDialog();

    submit();

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();
    expect(screen.getByText('Topic is required')).toBeInTheDocument();
    expect(createFeed).not.toHaveBeenCalled();
  });

  it('submits the mapped payload with the hidden ranking defaults', async () => {
    createFeed.mockResolvedValue(createdFeed);
    renderDialog();
    await openDialog();

    fillValidForm();
    submit();

    await waitFor(() => expect(createFeed).toHaveBeenCalledTimes(1));
    expect(createFeed).toHaveBeenCalledWith({
      name: 'Frontend weekly',
      description: undefined,
      sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 1 }],
      interests: [{ topic: 'react', weight: 0.5, keywords: ['hooks'] }],
    });
  });

  it('closes the dialog once the feed is created', async () => {
    createFeed.mockResolvedValue(createdFeed);
    renderDialog();
    await openDialog();

    fillValidForm();
    submit();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('adds and removes source rows, keeping the last row', async () => {
    renderDialog();
    await openDialog();

    expect(screen.getAllByLabelText('Source URL')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove source' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Add source' }));

    expect(screen.getAllByLabelText('Source URL')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove source' })[0] as HTMLElement);

    expect(screen.getAllByLabelText('Source URL')).toHaveLength(1);
  });

  it('adds interest rows and submits every one of them', async () => {
    createFeed.mockResolvedValue(createdFeed);
    renderDialog();
    await openDialog();

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add interest' }));
    fireEvent.change(screen.getAllByLabelText('Interest topic')[1] as HTMLElement, {
      target: { value: 'vite' },
    });
    submit();

    await waitFor(() => expect(createFeed).toHaveBeenCalledTimes(1));
    expect(createFeed.mock.calls[0]?.[0].interests).toEqual([
      { topic: 'react', weight: 0.5, keywords: ['hooks'] },
      { topic: 'vite', weight: 0.5, keywords: [] },
    ]);
  });

  it('keeps the dialog open and shows a readable message when the name is taken', async () => {
    createFeed.mockRejectedValue(
      new ApiError(500, '/feeds', {
        error:
          'Failed query: insert into "feeds" ("id", "name") values (default, $1)\nparams: Frontend weekly',
      }),
    );
    renderDialog();
    await openDialog();

    fillValidForm();
    submit();

    expect(
      await screen.findByText('Could not create the feed — the name may already be taken.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.queryByText(/insert into/),
      'the raw failed query must never be shown',
    ).not.toBeInTheDocument();
  });

  it('rejects a duplicate source URL on the offending row before sending a request', async () => {
    renderDialog();
    await openDialog();

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add source' }));
    fireEvent.change(screen.getAllByLabelText('Source URL')[1] as HTMLElement, {
      target: { value: 'https://example.com/feed.xml' },
    });
    submit();

    expect(await screen.findByText('This source is already listed')).toBeInTheDocument();
    expect(createFeed).not.toHaveBeenCalled();
  });

  it('rejects a duplicate interest topic before sending a request', async () => {
    renderDialog();
    await openDialog();

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add interest' }));
    fireEvent.change(screen.getAllByLabelText('Interest topic')[1] as HTMLElement, {
      target: { value: 'React' },
    });
    submit();

    expect(await screen.findByText('This topic is already listed')).toBeInTheDocument();
    expect(createFeed).not.toHaveBeenCalled();
  });
});
