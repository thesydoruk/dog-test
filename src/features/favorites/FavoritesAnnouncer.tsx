import { useFavorites } from './FavoritesContext';

/**
 * Visually hidden live region that tells screen reader users what just happened to their
 * favorites, e.g. "Pug added to favorites".
 *
 * The visible list may be far away (below the fold on phones), so this is their only immediate
 * feedback. The message comes from `lastChange` in the favorites reducer rather than from an
 * effect, which keeps it in sync without extra renders. It starts empty, so nothing is announced
 * on page load.
 *
 * Render it once per page, inside {@link FavoritesProvider}.
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
