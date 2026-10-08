import { useFavorites } from './FavoritesContext';

/**
 * Tells screen reader users what happened when they favorite or remove a dog.
 * The visible list may be far away (below the fold on phones), so a live region
 * is the only immediate feedback they get.
 */
export function FavoritesAnnouncer() {
  const { lastChange } = useFavorites();
  const message = lastChange
    ? `${lastChange.dog.breed.name} ${lastChange.type === 'added' ? 'added to' : 'removed from'} favorites`
    : '';

  return (
    <div role="status" className="visually-hidden">
      {message}
    </div>
  );
}
