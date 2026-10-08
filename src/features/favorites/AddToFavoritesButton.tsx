import type { Dog } from '@/domain/dog';
import { useFavorites } from './FavoritesContext';
import { HeartIcon } from './HeartIcon';

export function AddToFavoritesButton({ dog }: { dog: Dog }) {
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
