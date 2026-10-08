import { RAW_BREED_LIST } from '@/test/fixtures';
import { breedRefFromSlug, isValidBreedSlug, parseBreedList, subBreedSlug } from '../breedCatalog';

describe('isValidBreedSlug', () => {
  it.each(['pug', 'hound', 'germanshepherd', 'a1'])('accepts %s', (slug) => {
    expect(isValidBreedSlug(slug)).toBe(true);
  });

  it.each(['', 'Hound', 'hound-afghan', 'hound/afghan', '../x', 'pug ', 'ß'])(
    'rejects %j',
    (slug) => {
      expect(isValidBreedSlug(slug)).toBe(false);
    },
  );
});

describe('subBreedSlug', () => {
  it('matches the slug used in image URLs', () => {
    expect(subBreedSlug('hound', 'afghan')).toBe('hound-afghan');
  });
});

describe('parseBreedList', () => {
  it('turns the raw list into breeds with named sub-breeds', () => {
    const breeds = parseBreedList(RAW_BREED_LIST);

    expect(breeds.map((b) => b.name)).toEqual(['Beagle', 'Bulldog', 'Hound', 'Pug']);
    expect(breeds[2]).toEqual({
      slug: 'hound',
      name: 'Hound',
      subBreeds: [
        { slug: 'hound-afghan', name: 'Afghan Hound' },
        { slug: 'hound-basset', name: 'Basset Hound' },
        { slug: 'hound-blood', name: 'Blood Hound' },
      ],
    });
    expect(breeds[0]?.subBreeds).toEqual([]);
  });

  it('drops entries that are not valid slugs', () => {
    const breeds = parseBreedList({
      pug: [],
      'Bad Breed': [],
      hound: ['afghan', 'Not Valid', ''],
      // The API has never done this, but a bad payload must not crash the app.
      broken: 'nope' as unknown as string[],
    });

    expect(breeds).toEqual([
      { slug: 'pug', name: 'Pug', subBreeds: [] },
      { slug: 'hound', name: 'Hound', subBreeds: [{ slug: 'hound-afghan', name: 'Afghan Hound' }] },
      { slug: 'broken', name: 'Broken', subBreeds: [] },
    ]);
  });

  it('returns an empty list for an empty catalog', () => {
    expect(parseBreedList({})).toEqual([]);
  });
});

describe('breedRefFromSlug', () => {
  it.each([
    ['pug', { breed: 'pug' }],
    ['hound-afghan', { breed: 'hound', subBreed: 'afghan' }],
    ['spaniel-cocker-english', { breed: 'spaniel', subBreed: 'cocker-english' }],
    ['', { breed: '' }],
  ])('splits %j', (slug, ref) => {
    expect(breedRefFromSlug(slug)).toEqual(ref);
  });
});
