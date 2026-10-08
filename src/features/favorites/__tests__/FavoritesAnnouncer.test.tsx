import { screen } from '@testing-library/react';
import { mainDog } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { AddToFavoritesButton } from '../AddToFavoritesButton';
import { FavoritesAnnouncer } from '../FavoritesAnnouncer';

describe('FavoritesAnnouncer', () => {
  it('starts silent and announces additions and removals', async () => {
    const { user } = renderWithProviders(
      <>
        <AddToFavoritesButton dog={mainDog} />
        <FavoritesAnnouncer />
      </>,
    );

    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(status).toHaveTextContent('Afghan Hound added to favorites');

    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }));
    expect(status).toHaveTextContent('Afghan Hound removed from favorites');
  });
});
