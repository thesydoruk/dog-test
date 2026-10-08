import { screen, within } from '@testing-library/react';
import { loadFavorites } from '@/features/favorites/storage';
import { mainDog, THUMBNAIL_URLS } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { App } from '../App';

const mainBreed = () => screen.getByTestId('main-dog-breed');
const thumbnails = () => screen.getByRole('region', { name: 'More dogs' });
const favorites = () => screen.getByRole('complementary', { name: /favorites/i });
const findThumbnailButtons = async () =>
  within(await within(thumbnails()).findByRole('list')).getAllByRole('button');

describe('App', () => {
  it('renders the page structure', async () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Dog Viewer' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(favorites()).toBeInTheDocument();
    expect(await findThumbnailButtons()).toHaveLength(10);
    expect(mainBreed()).toHaveTextContent('Afghan Hound');
    expect(screen.getByRole('link', { name: 'Favorites (0)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('supports the full favorites flow', async () => {
    const { user } = renderWithProviders(<App />);
    await screen.findByTestId('main-dog-breed');

    // Favorite the random main dog.
    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(within(favorites()).getByRole('button', { name: 'Afghan Hound' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Afghan Hound added to favorites');
    expect(screen.getByRole('link', { name: 'Favorites (1)' })).toBeInTheDocument();

    // Show a thumbnail, then favorite it too.
    await user.click(within(thumbnails()).getByRole('button', { name: 'Pug' }));
    expect(mainBreed()).toHaveTextContent('Pug');
    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(within(favorites()).getAllByRole('listitem')).toHaveLength(2);
    expect(loadFavorites().map((dog) => dog.breed.name)).toEqual(['Afghan Hound', 'Pug']);

    // Clicking a favorite shows it as the main image.
    await user.click(within(favorites()).getByRole('button', { name: 'Afghan Hound' }));
    expect(mainBreed()).toHaveTextContent('Afghan Hound');
    expect(screen.getByRole('img', { name: 'Afghan Hound' })).toHaveAttribute(
      'src',
      mainDog.imageUrl,
    );
    expect(screen.getByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument();

    // Removing it from the list updates the main button state.
    await user.click(
      within(favorites()).getByRole('button', { name: 'Remove Afghan Hound from favorites' }),
    );
    expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeInTheDocument();
    expect(within(favorites()).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Afghan Hound removed from favorites');
  });

  it('restores favorites saved in a previous session', async () => {
    const first = renderWithProviders(<App />);
    await first.user.click(await screen.findByRole('button', { name: 'Add to favorites' }));
    first.unmount();

    renderWithProviders(<App />);
    const restored = within(favorites()).getByRole('button', { name: 'Afghan Hound' });
    expect(restored.querySelector('img')).toHaveAttribute('src', mainDog.imageUrl);
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeVisible();
  });

  it('keeps showing a picked thumbnail even if it is not the random dog', async () => {
    const { user } = renderWithProviders(<App />);
    await user.click(await within(thumbnails()).findByRole('button', { name: 'Husky' }));

    expect(screen.getByRole('img', { name: 'Husky' })).toHaveAttribute('src', THUMBNAIL_URLS[2]);
  });
});
