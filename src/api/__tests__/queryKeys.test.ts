import { breedKeys, dogKeys } from '../queryKeys';

describe('query keys', () => {
  it('nest under the dogs root so they can be invalidated together', () => {
    expect(dogKeys.randomOne()).toEqual(['dogs', 'random', 'one']);
    expect(dogKeys.randomMany(10)).toEqual(['dogs', 'random', 'many', 10]);
    expect(dogKeys.randomByBreed({ breed: 'hound' }, 5)).toEqual([
      'dogs',
      'random',
      'breed',
      'hound',
      5,
    ]);
    expect(dogKeys.randomByBreed({ breed: 'hound', subBreed: 'afghan' }, 5)).toEqual([
      'dogs',
      'random',
      'breed',
      'hound/afghan',
      5,
    ]);
    expect(dogKeys.breedImages({ breed: 'pug' })).toEqual(['dogs', 'breed', 'pug', 'images']);
  });

  it('keeps the breed catalog separate from dog photos', () => {
    expect(breedKeys.list()).toEqual(['breeds', 'list']);
  });
});
