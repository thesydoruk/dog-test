import { createDog, isDog } from './dog';

const url = 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg';

describe('createDog', () => {
  it('uses the image URL as id and derives the breed', () => {
    expect(createDog(url)).toEqual({
      id: url,
      imageUrl: url,
      breed: { slug: 'hound-afghan', name: 'Afghan Hound' },
    });
  });
});

describe('isDog', () => {
  it('accepts a valid dog', () => {
    expect(isDog(createDog(url))).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'dog'],
    ['a number', 42],
    ['missing id', { imageUrl: url, breed: { slug: 'a', name: 'A' } }],
    ['missing imageUrl', { id: url, breed: { slug: 'a', name: 'A' } }],
    ['missing breed', { id: url, imageUrl: url }],
    ['null breed', { id: url, imageUrl: url, breed: null }],
    ['breed without name', { id: url, imageUrl: url, breed: { slug: 'a' } }],
    ['breed without slug', { id: url, imageUrl: url, breed: { name: 'A' } }],
  ])('rejects %s', (_, value) => {
    expect(isDog(value)).toBe(false);
  });
});
