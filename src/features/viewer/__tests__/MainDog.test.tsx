import { screen, waitFor, within } from '@testing-library/react';
import { delay, http } from 'msw';
import { mainDog, THUMBNAIL_URLS } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { apiError, randomDogUrl, server, success } from '@/test/server';
import { MainDog } from '../MainDog';
import { ThumbnailGrid } from '../ThumbnailGrid';

const region = () => screen.getByRole('region', { name: 'Featured dog' });

describe('MainDog', () => {
  it('shows a loading state, then the random dog labelled by breed', async () => {
    server.use(
      http.get(randomDogUrl, async () => {
        await delay(20);
        return success(mainDog.imageUrl);
      }),
    );
    renderWithProviders(<MainDog />);

    expect(within(region()).getByRole('status')).toHaveTextContent('Loading a dog…');

    const image = await within(region()).findByRole('img', { name: 'Afghan Hound' });
    expect(image).toHaveAttribute('src', mainDog.imageUrl);
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(screen.getByTestId('main-dog-breed')).toHaveTextContent('Afghan Hound');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('fills the frame with a blurred copy of the photo', async () => {
    renderWithProviders(<MainDog />);
    const image = await within(region()).findByRole('img');

    const backdrop = image.previousElementSibling as HTMLElement;
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    expect(backdrop.style.backgroundImage).toBe(`url("${mainDog.imageUrl}")`);
  });

  it('renders actions for the shown dog', async () => {
    const renderActions = vi.fn(() => <button type="button">Act</button>);
    renderWithProviders(<MainDog renderActions={renderActions} />);

    expect(await screen.findByRole('button', { name: 'Act' })).toBeInTheDocument();
    expect(renderActions).toHaveBeenLastCalledWith(mainDog);
  });

  it('scrolls the frame into view when the user picks another dog', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: -200,
      bottom: 100,
    } as DOMRect);

    const { user } = renderWithProviders(
      <>
        <MainDog />
        <ThumbnailGrid />
      </>,
    );
    await screen.findByTestId('main-dog-breed');
    await within(screen.getByRole('region', { name: 'More dogs' })).findByRole('list');
    // The initial load must not scroll.
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Pug' }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('img', { name: 'Pug' })).toHaveAttribute('src', THUMBNAIL_URLS[1]);

    // Picking the same dog again is a no-op.
    await user.click(screen.getByRole('button', { name: 'Pug' }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    // @ts-expect-error jsdom has no scrollIntoView; restore its absence.
    delete Element.prototype.scrollIntoView;
  });

  it('shows an error and recovers on retry', async () => {
    let fail = true;
    server.use(http.get(randomDogUrl, () => (fail ? apiError() : success(mainDog.imageUrl))));
    const { user } = renderWithProviders(<MainDog />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't fetch a dog right now.");

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('img', { name: 'Afghan Hound' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
