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
import { favoritesReducer } from './favoritesReducer';
import { loadFavorites, saveFavorites } from './storage';

interface FavoritesContextValue {
  favorites: Dog[];
  addFavorite: (dog: Dog) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
  initialFavorites?: Dog[];
}

export function FavoritesProvider({ children, initialFavorites }: FavoritesProviderProps) {
  const [favorites, dispatch] = useReducer(
    favoritesReducer,
    initialFavorites,
    (initial) => initial ?? loadFavorites(),
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
    () => ({ favorites, addFavorite, removeFavorite, isFavorite }),
    [favorites, addFavorite, removeFavorite, isFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
