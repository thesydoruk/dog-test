import type { Dog } from '@/domain/dog';

export interface FavoritesChange {
  type: 'added' | 'removed';
  dog: Dog;
}

export interface FavoritesState {
  items: Dog[];
  /** The most recent change, so the UI can announce it to assistive technology. */
  lastChange: FavoritesChange | null;
}

export type FavoritesAction = { type: 'add'; dog: Dog } | { type: 'remove'; id: string };

export function createFavoritesState(items: Dog[] = []): FavoritesState {
  return { items, lastChange: null };
}

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
