import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { createFavoritesState, favoritesReducer } from '../favoritesReducer';

const [first, second] = thumbnailDogs as [(typeof thumbnailDogs)[0], (typeof thumbnailDogs)[0]];

describe('createFavoritesState', () => {
  it('starts empty with no change', () => {
    expect(createFavoritesState()).toEqual({ items: [], lastChange: null });
    expect(createFavoritesState([first])).toEqual({ items: [first], lastChange: null });
  });
});

describe('favoritesReducer', () => {
  it('appends a new favorite and records the change', () => {
    expect(favoritesReducer(createFavoritesState([first]), { type: 'add', dog: mainDog })).toEqual({
      items: [first, mainDog],
      lastChange: { type: 'added', dog: mainDog },
    });
  });

  it('ignores a dog that is already a favorite', () => {
    const state = createFavoritesState([first, mainDog]);
    expect(favoritesReducer(state, { type: 'add', dog: { ...mainDog } })).toBe(state);
  });

  it('removes a favorite by id and records the change', () => {
    expect(
      favoritesReducer(createFavoritesState([first, second]), { type: 'remove', id: first.id }),
    ).toEqual({ items: [second], lastChange: { type: 'removed', dog: first } });
  });

  it('keeps the same state when removing an unknown id', () => {
    const state = createFavoritesState([first]);
    expect(favoritesReducer(state, { type: 'remove', id: 'missing' })).toBe(state);
  });
});
