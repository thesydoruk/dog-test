import { screen } from '@testing-library/react';
import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { FavoritesJumpLink } from '../FavoritesJumpLink';
import { FavoritesPanel } from '../FavoritesPanel';

describe('FavoritesJumpLink', () => {
  it('shows the number of favorites', () => {
    renderWithProviders(<FavoritesJumpLink />, { initialFavorites: [mainDog, thumbnailDogs[0]!] });

    expect(screen.getByRole('link', { name: 'Favorites (2)' })).toHaveAttribute(
      'href',
      '#favorites-heading',
    );
  });

  it('scrolls to the favorites heading and focuses it', async () => {
    const { user } = renderWithProviders(
      <>
        <FavoritesJumpLink />
        <FavoritesPanel selectedId={null} onSelect={() => {}} />
      </>,
    );
    const heading = screen.getByRole('heading', { name: /favorites/i });
    heading.scrollIntoView = vi.fn();

    await user.click(screen.getByRole('link', { name: 'Favorites (0)' }));

    expect(heading.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
    expect(heading).toHaveFocus();
  });

  it('falls back to normal link behaviour without a favorites panel', async () => {
    const { user } = renderWithProviders(<FavoritesJumpLink />);
    const link = screen.getByRole('link', { name: 'Favorites (0)' });

    await user.click(link);
    expect(window.location.hash).toBe('#favorites-heading');
    window.location.hash = '';
  });
});
