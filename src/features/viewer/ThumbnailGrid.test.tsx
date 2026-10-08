import { screen, within } from '@testing-library/react';
import { delay, http } from 'msw';
import { MAIN_DOG_URL, THUMBNAIL_URLS, thumbnailDogs } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { apiError, randomDogsUrl, server, success } from '@/test/server';
import { MainDog } from './MainDog';
import { ThumbnailGrid } from './ThumbnailGrid';

const grid = () => screen.getByRole('region', { name: 'More dogs' });

describe('ThumbnailGrid', () => {
  it('shows a skeleton for each thumbnail while loading', async () => {
    server.use(
      http.get(randomDogsUrl, async () => {
        await delay(20);
        return success(THUMBNAIL_URLS);
      }),
    );
    renderWithProviders(<ThumbnailGrid />);

    const status = within(grid()).getByRole('status');
    expect(status).toHaveTextContent('Loading more dogs…');
    expect(status.querySelectorAll('li')).toHaveLength(10);

    expect(await within(grid()).findAllByRole('button')).toHaveLength(10);
  });

  it('shows 10 thumbnails labelled by breed', async () => {
    renderWithProviders(<ThumbnailGrid />);

    const buttons = await within(grid()).findAllByRole('button');
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

    expect(await within(grid()).findAllByRole('button')).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('shows an error and recovers on retry', async () => {
    let fail = true;
    server.use(http.get(randomDogsUrl, () => (fail ? apiError() : success(THUMBNAIL_URLS))));
    const { user } = renderWithProviders(<ThumbnailGrid />);

    const alert = await within(grid()).findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't fetch more dogs.");

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await within(grid()).findAllByRole('button')).toHaveLength(10);
  });
});
