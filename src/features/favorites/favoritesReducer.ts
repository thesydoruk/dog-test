import type { Dog } from '@/domain/dog';

/** A single change to the favorites list, kept so it can be announced. */
export interface FavoritesChange {
  /** What happened. */
  type: 'added' | 'removed';
  /** The dog that was added or removed. */
  dog: Dog;
}

/** State managed by {@link favoritesReducer}. Create the initial value with {@link createFavoritesState}. */
export interface FavoritesState {
  /** Saved dogs, oldest first, never with duplicate ids. */
  items: Dog[];
  /**
   * The most recent change, so the UI can announce it to assistive technology without diffing
   * lists in an effect. `null` until the first change.
   */
  lastChange: FavoritesChange | null;
}

/**
 * Actions understood by {@link favoritesReducer}.
 *
 * - `add`: save a dog (no-op if already saved).
 * - `remove`: remove the dog with `id` (no-op if absent).
 *
 * When adding an action, update `lastChange` too so the announcer keeps working.
 */
export type FavoritesAction = { type: 'add'; dog: Dog } | { type: 'remove'; id: string };

/**
 * Creates the initial {@link FavoritesState}.
 *
 * @param items - Dogs to start with, e.g. loaded from storage.
 */
export function createFavoritesState(items: Dog[] = []): FavoritesState {
  return { items, lastChange: null };
}

/**
 * Pure reducer for the favorites list.
 *
 * No-op actions (adding a saved dog, removing an unknown id) return the same state object, so
 * React skips the re-render and the storage effect doesn't fire.
 *
 * @param state - Current state.
 * @param action - What to change.
 * @returns The next state, or `state` itself when nothing changed.
 */
export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'add': {
      if (state.items.some((dog) => dog.id === action.dog.id)) return state;
      return {
        items: [...state.items, action.dog],
        lastChange: { type: 'added', dog: action.dog },
      };
    }
    case 'remove': {
      const dog = state.items.find((item) => item.id === action.id);
      if (!dog) return state;
      return {
        items: state.items.filter((item) => item.id !== action.id),
        lastChange: { type: 'removed', dog },
      };
    }
  }
}
