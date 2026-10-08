import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { MAIN_DOG_URL, THUMBNAIL_URLS, thumbnailDogs } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { apiError, randomDogsUrl, server, success } from '@/test/server';
import { MainDog } from '../MainDog';
import { ThumbnailGrid } from '../ThumbnailGrid';

const grid = () => screen.getByRole('region', { name: 'More dogs' });
const thumbnails = () => within(within(grid()).getByRole('list')).getAllByRole('button');
const findThumbnails = async () => {
  await within(grid()).findByRole('list');
  return thumbnails();
};
const newDogsButton = () => within(grid()).getByRole('button', { name: 'New dogs' });

const ALT_URLS = [
  'https://images.dog.ceo/breeds/akita/1.jpg',
  'https://images.dog.ceo/breeds/boxer/2.jpg',
];

describe('ThumbnailGrid', () => {
  it('shows a skeleton for each thumbnail while loading', async () => {
    server.use(
      http.get(randomDogsUrl, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return success(THUMBNAIL_URLS);
      }),
    );
    renderWithProviders(<ThumbnailGrid />);

    const status = within(grid()).getByRole('status');
    expect(status).toHaveTextContent('Loading more dogs…');
    expect(status.querySelectorAll('li')).toHaveLength(10);
    expect(within(grid()).queryByRole('button', { name: 'New dogs' })).not.toBeInTheDocument();

    expect(await findThumbnails()).toHaveLength(10);
    expect(newDogsButton()).toBeInTheDocument();
  });

  it('shows 10 thumbnails labelled by breed', async () => {
    renderWithProviders(<ThumbnailGrid />);

    const buttons = await findThumbnails();
    expect(buttons.map((button) => button.textContent)).toEqual(
      thumbnailDogs.map((dog) => dog.breed.name),
    );
    buttons.forEach((button, index) => {
      expect(button.querySelector('img')).toHaveAttribute('src', THUMBNAIL_URLS[index]);
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('makes a clicked thumbnail the main image', async () => {
    const { user } = renderWithProviders(
      <>
        <MainDog />
        <ThumbnailGrid />
      </>,
    );
    expect(await screen.findByTestId('main-dog-breed')).toHaveTextContent('Afghan Hound');

    const pug = within(grid()).getByRole('button', { name: 'Pug' });
    await user.click(pug);

    expect(screen.getByTestId('main-dog-breed')).toHaveTextContent('Pug');
    expect(screen.getByRole('img', { name: 'Pug' })).toHaveAttribute('src', THUMBNAIL_URLS[1]);
    expect(pug).toHaveAttribute('aria-pressed', 'true');
    expect(within(grid()).getAllByRole('button', { pressed: true })).toHaveLength(1);
  });

  it('marks a thumbnail that matches the main dog as selected', async () => {
    server.use(http.get(randomDogsUrl, () => success([MAIN_DOG_URL, THUMBNAIL_URLS[0]])));
    renderWithProviders(
      <>
        <MainDog />
        <ThumbnailGrid />
      </>,
    );

    expect(await within(grid()).findByRole('button', { name: 'Afghan Hound' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders duplicate photos without key clashes', async () => {
    const consoleError = vi.spyOn(console, 'error');
    server.use(http.get(randomDogsUrl, () => success([MAIN_DOG_URL, MAIN_DOG_URL])));
    renderWithProviders(<ThumbnailGrid />);

    expect(await findThumbnails()).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('loads a new set of dogs on demand, keeping the old ones visible meanwhile', async () => {
    let calls = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(randomDogsUrl, async () => {
        calls += 1;
        if (calls === 1) return success(THUMBNAIL_URLS);
        await gate;
        return success(ALT_URLS);
      }),
    );
    const { user } = renderWithProviders(<ThumbnailGrid />);
    await findThumbnails();

    await user.click(newDogsButton());

    expect(newDogsButton()).toHaveAttribute('aria-disabled', 'true');
    expect(within(grid()).getByRole('status')).toHaveTextContent('Loading new dogs…');
    expect(within(grid()).getByRole('list')).toHaveAttribute('aria-busy', 'true');
    expect(thumbnails()).toHaveLength(10);

    // A second click while loading does not start another request.
    await user.click(newDogsButton());
    expect(calls).toBe(2);

    release();
    await waitFor(() => expect(thumbnails().map((b) => b.textContent)).toEqual(['Akita', 'Boxer']));
    expect(newDogsButton()).toHaveAttribute('aria-disabled', 'false');
    expect(within(grid()).queryByRole('status')).not.toBeInTheDocument();
    expect(within(grid()).getByRole('list')).toHaveAttribute('aria-busy', 'false');
  });

  it('shows an error and recovers on retry', async () => {
    let fail = true;
    server.use(http.get(randomDogsUrl, () => (fail ? apiError() : success(THUMBNAIL_URLS))));
    const { user } = renderWithProviders(<ThumbnailGrid />);

    const alert = await within(grid()).findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't fetch more dogs.");
    expect(within(grid()).queryByRole('button', { name: 'New dogs' })).not.toBeInTheDocument();

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await findThumbnails()).toHaveLength(10);
  });
});
