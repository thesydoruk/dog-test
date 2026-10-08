import type { Dog } from '@/domain/dog';
import { useFavorites } from '../FavoritesContext';
import { HeartIcon } from './HeartIcon';

/** Props for {@link AddToFavoritesButton}. */
interface AddToFavoritesButtonProps {
  /** The dog to add or remove; usually the one shown as the main image. */
  dog: Dog;
}

/**
 * Toggles a dog in and out of favorites.
 *
 * Reads "Add to favorites" with an outlined heart, or "Remove from favorites" with a filled one
 * once the dog is saved. The label changes instead of using `aria-pressed`, so screen readers
 * announce what the next click will do. Adding the same dog twice is impossible: the favorites
 * reducer ignores duplicates.
 *
 * Must be rendered inside {@link FavoritesProvider}.
 */
export function AddToFavoritesButton({ dog }: AddToFavoritesButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(dog.id);

  return (
    <button
      type="button"
      className={favorited ? 'button button--active' : 'button'}
      onClick={() => (favorited ? removeFavorite(dog.id) : addFavorite(dog))}
    >
      <HeartIcon filled={favorited} />
      {favorited ? 'Remove from favorites' : 'Add to favorites'}
    </button>
  );
}
