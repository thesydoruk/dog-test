import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { FAVORITES_STORAGE_KEY, loadFavorites, saveFavorites } from '../storage';

describe('favorites storage', () => {
  it('round-trips favorites through localStorage', () => {
    saveFavorites([mainDog]);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe(JSON.stringify([mainDog]));
    expect(loadFavorites()).toEqual([mainDog]);
  });

  it('returns an empty list when nothing is stored', () => {
    expect(loadFavorites()).toEqual([]);
  });

  it('returns an empty list for corrupted JSON', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '{not json');
    expect(loadFavorites()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ dog: mainDog }));
    expect(loadFavorites()).toEqual([]);
  });

  it('drops entries that are not valid dogs', () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([mainDog, { id: 1 }, null, thumbnailDogs[0]]),
    );
    expect(loadFavorites()).toEqual([mainDog, thumbnailDogs[0]]);
  });

  it('works without storage', () => {
    expect(loadFavorites(null)).toEqual([]);
    expect(() => saveFavorites([mainDog], null)).not.toThrow();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as unknown as Storage;

    expect(loadFavorites(broken)).toEqual([]);
    expect(() => saveFavorites([mainDog], broken)).not.toThrow();
  });

  it('survives localStorage being inaccessible', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(loadFavorites()).toEqual([]);
    expect(() => saveFavorites([mainDog])).not.toThrow();
  });
});
