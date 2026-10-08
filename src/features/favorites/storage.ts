import { isDog, type Dog } from '@/domain/dog';

export const FAVORITES_STORAGE_KEY = 'dog-viewer:favorites';

/** `localStorage` can throw (privacy modes, disabled storage), so access is always guarded. */
function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadFavorites(storage: Storage | null = getStorage()): Dog[] {
  try {
    const raw = storage?.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isDog) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: Dog[], storage: Storage | null = getStorage()): void {
  try {
    storage?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Quota exceeded or storage disabled: favorites still work for this session.
  }
}
