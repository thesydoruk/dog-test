import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';
import { FAVORITES_STORAGE_KEY, loadFavorites } from '../storage';

const wrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

describe('FavoritesContext', () => {
  it('loads favorites from storage on start', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([mainDog]));
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites).toEqual([mainDog]);
    expect(result.current.lastChange).toBeNull();
    expect(result.current.isFavorite(mainDog.id)).toBe(true);
  });

  it('prefers explicit initial favorites over storage', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([mainDog]));
    const { result } = renderHook(() => useFavorites(), {
      wrapper: ({ children }) => (
        <FavoritesProvider initialFavorites={[]}>{children}</FavoritesProvider>
      ),
    });

    expect(result.current.favorites).toEqual([]);
  });

  it('adds and removes favorites, tracks the last change and persists', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    const other = thumbnailDogs[0]!;

    act(() => result.current.addFavorite(mainDog));
    act(() => result.current.addFavorite(other));
    act(() => result.current.addFavorite(mainDog));
    expect(result.current.favorites).toEqual([mainDog, other]);
    expect(result.current.lastChange).toEqual({ type: 'added', dog: other });
    expect(loadFavorites()).toEqual([mainDog, other]);

    act(() => result.current.removeFavorite(mainDog.id));
    expect(result.current.favorites).toEqual([other]);
    expect(result.current.lastChange).toEqual({ type: 'removed', dog: mainDog });
    expect(result.current.isFavorite(mainDog.id)).toBe(false);
    expect(loadFavorites()).toEqual([other]);
  });

  it('throws outside of the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useFavorites())).toThrow(/within a FavoritesProvider/);
  });
});
