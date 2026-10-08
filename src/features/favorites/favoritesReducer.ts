import type { Dog } from '@/domain/dog';

export type FavoritesState = Dog[];

export type FavoritesAction = { type: 'add'; dog: Dog } | { type: 'remove'; id: string };

export function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'add':
      return state.some((dog) => dog.id === action.dog.id) ? state : [...state, action.dog];
    case 'remove': {
      const next = state.filter((dog) => dog.id !== action.id);
      return next.length === state.length ? state : next;
    }
  }
}
