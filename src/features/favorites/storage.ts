/**
 * Persistence of favorites in `localStorage`.
 *
 * Every access is guarded: storage can be missing, throw (Safari private mode, disabled site
 * data) or hold corrupted data. In all those cases favorites still work for the session, they
 * just aren't remembered.
 *
 * @module
 */
import { isDog, type Dog } from '@/domain/dog';

/** `localStorage` key holding the JSON array of favorite dogs. */
export const FAVORITES_STORAGE_KEY = 'dog-viewer:favorites';

/** `window.localStorage`, or `null` when merely touching it throws. */
function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads saved favorites.
 *
 * Never throws: missing, unreadable or corrupted data yields `[]`, and entries that don't look
 * like a {@link Dog} are dropped while the valid ones are kept.
 *
 * @param storage - Where to read from; defaults to `localStorage`. Tests pass their own.
 * @returns The saved dogs, in the order they were saved.
 */
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

/**
 * Writes favorites, replacing whatever was saved before.
 *
 * Never throws: if the quota is exceeded or storage is disabled the write is skipped.
 *
 * @param favorites - The full list to save.
 * @param storage - Where to write; defaults to `localStorage`. Tests pass their own.
 */
export function saveFavorites(favorites: Dog[], storage: Storage | null = getStorage()): void {
  try {
    storage?.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Quota exceeded or storage disabled: favorites still work for this session.
  }
}
