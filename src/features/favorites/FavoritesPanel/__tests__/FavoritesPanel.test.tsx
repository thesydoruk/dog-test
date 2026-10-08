import { screen, within } from '@testing-library/react';
import type { Dog } from '@/domain/dog';
import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { FavoritesPanel } from '../FavoritesPanel';

const [pug, husky] = [thumbnailDogs[1]!, thumbnailDogs[2]!];

function renderPanel(favorites: Dog[], selectedId: string | null = null) {
  const onSelect = vi.fn();
  const result = renderWithProviders(
    <FavoritesPanel selectedId={selectedId} onSelect={onSelect} />,
    { initialFavorites: favorites },
  );
  const panel = screen.getByRole('complementary', { name: /favorites/i });
  return { ...result, onSelect, panel };
}

describe('FavoritesPanel', () => {
  it('shows an empty state', () => {
    const { panel } = renderPanel([]);

    expect(within(panel).getByRole('heading', { name: /favorites/i })).toBeInTheDocument();
    expect(within(panel).getByTestId('favorites-count')).toHaveTextContent('0');
    expect(panel).toHaveTextContent('No favorites yet.');
    expect(within(panel).queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists favorites with their breed and image', () => {
    const { panel } = renderPanel([mainDog, pug]);

    expect(within(panel).getByTestId('favorites-count')).toHaveTextContent('2');
    const items = within(panel).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole('button', { name: 'Afghan Hound' })).toBeInTheDocument();
    expect(items[0]!.querySelector('img')).toHaveAttribute('src', mainDog.imageUrl);
  });

  it('highlights the favorite shown as the main image', () => {
    const { panel } = renderPanel([mainDog, pug], pug.id);

    expect(within(panel).getByRole('button', { name: 'Pug' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(panel).getByRole('button', { name: 'Afghan Hound' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selects a favorite on click', async () => {
    const { panel, onSelect, user } = renderPanel([mainDog, pug]);

    await user.click(within(panel).getByRole('button', { name: 'Pug' }));
    expect(onSelect).toHaveBeenCalledWith(pug);
  });

  it('removes a favorite and moves focus to the next one', async () => {
    const { panel, user } = renderPanel([mainDog, pug, husky]);

    await user.click(within(panel).getByRole('button', { name: 'Remove Pug from favorites' }));

    expect(within(panel).queryByRole('button', { name: 'Pug' })).not.toBeInTheDocument();
    expect(within(panel).getByTestId('favorites-count')).toHaveTextContent('2');
    expect(within(panel).getByRole('button', { name: 'Husky' })).toHaveFocus();
  });

  it('moves focus to the previous favorite when removing the last one', async () => {
    const { panel, user } = renderPanel([mainDog, pug]);

    await user.click(within(panel).getByRole('button', { name: 'Remove Pug from favorites' }));
    expect(within(panel).getByRole('button', { name: 'Afghan Hound' })).toHaveFocus();
  });

  it('moves focus to the heading when the list becomes empty', async () => {
    const { panel, user } = renderPanel([mainDog]);

    await user.click(
      within(panel).getByRole('button', { name: 'Remove Afghan Hound from favorites' }),
    );
    expect(within(panel).getByRole('heading', { name: /favorites/i })).toHaveFocus();
    expect(panel).toHaveTextContent('No favorites yet.');
  });
});
