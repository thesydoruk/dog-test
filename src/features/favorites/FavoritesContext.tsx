import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { Dog } from '@/domain/dog';
import { createFavoritesState, favoritesReducer, type FavoritesChange } from './favoritesReducer';
import { loadFavorites, saveFavorites } from './storage';

/** What {@link useFavorites} returns. */
interface FavoritesContextValue {
  /** Saved dogs, oldest first. */
  favorites: Dog[];
  /** The most recent add or remove, or `null` before the first change. Drives the announcer. */
  lastChange: FavoritesChange | null;
  /** Saves a dog. Does nothing if it is already a favorite. */
  addFavorite: (dog: Dog) => void;
  /** Removes the favorite with this id. Does nothing if there is none. */
  removeFavorite: (id: string) => void;
  /** Whether the dog with this id is saved. */
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Props for {@link FavoritesProvider}. */
interface FavoritesProviderProps {
  /** Components that read or change favorites. */
  children: ReactNode;
  /**
   * Favorites to start with instead of the ones saved in `localStorage`.
   * Read once on mount; later changes to this prop are ignored.
   */
  initialFavorites?: Dog[];
}

/**
 * Holds the favorites list and keeps it in `localStorage`.
 *
 * State lives in {@link favoritesReducer}. On mount it is loaded from storage (or
 * `initialFavorites`), and every change is written back. Storage failures are swallowed, so
 * favorites keep working for the session even in private mode.
 */
export function FavoritesProvider({ children, initialFavorites }: FavoritesProviderProps) {
  const [{ items: favorites, lastChange }, dispatch] = useReducer(
    favoritesReducer,
    initialFavorites,
    (initial) => createFavoritesState(initial ?? loadFavorites()),
  );

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((dog: Dog) => dispatch({ type: 'add', dog }), []);
  const removeFavorite = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const isFavorite = useCallback(
    (id: string) => favorites.some((dog) => dog.id === id),
    [favorites],
  );

  const value = useMemo(
    () => ({ favorites, lastChange, addFavorite, removeFavorite, isFavorite }),
    [favorites, lastChange, addFavorite, removeFavorite, isFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

/**
 * Reads and changes the favorites list.
 *
 * `addFavorite` and `removeFavorite` are stable between renders, so they are safe in effect
 * dependency lists.
 *
 * @throws `Error` when called outside a {@link FavoritesProvider}.
 *
 * @example
 * ```tsx
 * const { isFavorite, addFavorite } = useFavorites();
 * if (!isFavorite(dog.id)) addFavorite(dog);
 * ```
 */
export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
