import { mainDog, thumbnailDogs } from '@/test/fixtures';
import { favoritesReducer } from '../favoritesReducer';

const [first, second] = thumbnailDogs as [(typeof thumbnailDogs)[0], (typeof thumbnailDogs)[0]];

describe('favoritesReducer', () => {
  it('appends a new favorite', () => {
    expect(favoritesReducer([first], { type: 'add', dog: mainDog })).toEqual([first, mainDog]);
  });

  it('ignores a dog that is already a favorite', () => {
    const state = [first, mainDog];
    expect(favoritesReducer(state, { type: 'add', dog: { ...mainDog } })).toBe(state);
  });

  it('removes a favorite by id', () => {
    expect(favoritesReducer([first, second], { type: 'remove', id: first.id })).toEqual([second]);
  });

  it('keeps the same state when removing an unknown id', () => {
    const state = [first];
    expect(favoritesReducer(state, { type: 'remove', id: 'missing' })).toBe(state);
  });
});
