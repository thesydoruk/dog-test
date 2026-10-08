import { screen } from '@testing-library/react';
import { mainDog } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { AddToFavoritesButton } from './AddToFavoritesButton';
import { loadFavorites } from './storage';

describe('AddToFavoritesButton', () => {
  it('toggles the dog in and out of favorites', async () => {
    const { user } = renderWithProviders(<AddToFavoritesButton dog={mainDog} />);

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(loadFavorites()).toEqual([mainDog]);

    await user.click(screen.getByRole('button', { name: 'Remove from favorites' }));
    expect(loadFavorites()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeInTheDocument();
  });

  it('reflects a dog that is already a favorite', () => {
    renderWithProviders(<AddToFavoritesButton dog={mainDog} />, { initialFavorites: [mainDog] });

    const button = screen.getByRole('button', { name: 'Remove from favorites' });
    expect(button).toHaveClass('button--active');
    expect(button.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });
});
