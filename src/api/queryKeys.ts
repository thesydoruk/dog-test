import type { BreedRef } from '@/domain/breedCatalog';

const breedPart = ({ breed, subBreed }: BreedRef) => (subBreed ? `${breed}/${subBreed}` : breed);

export const dogKeys = {
  all: ['dogs'] as const,
  randomOne: () => [...dogKeys.all, 'random', 'one'] as const,
  randomMany: (count: number) => [...dogKeys.all, 'random', 'many', count] as const,
  randomByBreed: (ref: BreedRef, count: number) =>
    [...dogKeys.all, 'random', 'breed', breedPart(ref), count] as const,
  breedImages: (ref: BreedRef) => [...dogKeys.all, 'breed', breedPart(ref), 'images'] as const,
};

export const breedKeys = {
  all: ['breeds'] as const,
  list: () => [...breedKeys.all, 'list'] as const,
};
