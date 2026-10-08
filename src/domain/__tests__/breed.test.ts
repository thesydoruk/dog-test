import { breedFromImageUrl, formatBreedName, parseBreedSlug, UNKNOWN_BREED } from '../breed';

describe('parseBreedSlug', () => {
  it.each([
    ['https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg', 'hound-afghan'],
    ['https://images.dog.ceo/breeds/pug/n02110958_1975.jpg', 'pug'],
    ['https://images.dog.ceo/breeds/germanshepherd/n02106662_10.jpg', 'germanshepherd'],
    ['https://images.dog.ceo/breeds/Terrier-Yorkshire/a.jpg', 'terrier-yorkshire'],
    ['https://images.dog.ceo/breeds/spaniel-cocker-english/a.jpg', 'spaniel-cocker-english'],
  ])('reads the slug from %s', (url, slug) => {
    expect(parseBreedSlug(url)).toBe(slug);
  });

  it.each([
    'https://example.com/dog.jpg',
    'https://images.dog.ceo/breeds/',
    'https://images.dog.ceo/breeds//a.jpg',
    '',
  ])('returns null for %j', (url) => {
    expect(parseBreedSlug(url)).toBeNull();
  });
});

describe('formatBreedName', () => {
  it.each([
    ['pug', 'Pug'],
    ['hound-afghan', 'Afghan Hound'],
    ['retriever-golden', 'Golden Retriever'],
    ['spaniel-cocker-english', 'English Cocker Spaniel'],
    ['germanshepherd', 'Germanshepherd'],
    ['bulldog--french', 'French Bulldog'],
  ])('formats %s as %s', (slug, name) => {
    expect(formatBreedName(slug)).toBe(name);
  });
});

describe('breedFromImageUrl', () => {
  it('builds a breed from a Dog API image URL', () => {
    expect(breedFromImageUrl('https://images.dog.ceo/breeds/bulldog-french/x.jpg')).toEqual({
      slug: 'bulldog-french',
      name: 'French Bulldog',
    });
  });

  it('falls back to an unknown breed', () => {
    expect(breedFromImageUrl('https://example.com/dog.jpg')).toBe(UNKNOWN_BREED);
  });
});
