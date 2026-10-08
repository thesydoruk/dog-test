/**
 * TanStack Query keys for every Dog API request.
 *
 * Keys are hierarchical, so a prefix invalidates a whole family:
 * `queryClient.invalidateQueries({ queryKey: dogKeys.all })` refetches every dog photo query, while
 * the breed catalog under {@link breedKeys} is left alone.
 *
 * @module
 */
import type { BreedRef } from '@/domain/breedCatalog';

/** `hound` or `hound/afghan`, so a breed and its sub-breed never share a cache entry. */
const breedPart = ({ breed, subBreed }: BreedRef) => (subBreed ? `${breed}/${subBreed}` : breed);

/** Query keys for dog photos. */
export const dogKeys = {
  /** Root of every photo query: `['dogs']`. */
  all: ['dogs'] as const,
  /** The single random dog shown as the main image. */
  randomOne: () => [...dogKeys.all, 'random', 'one'] as const,
  /** A set of `count` random dogs (the thumbnails). */
  randomMany: (count: number) => [...dogKeys.all, 'random', 'many', count] as const,
  /** `count` random dogs of one breed or sub-breed. */
  randomByBreed: (ref: BreedRef, count: number) =>
    [...dogKeys.all, 'random', 'breed', breedPart(ref), count] as const,
  /** Every photo of one breed or sub-breed. */
  breedImages: (ref: BreedRef) => [...dogKeys.all, 'breed', breedPart(ref), 'images'] as const,
};

/** Query keys for the breed catalog, kept apart from photos so it survives photo invalidation. */
export const breedKeys = {
  /** Root of every catalog query: `['breeds']`. */
  all: ['breeds'] as const,
  /** The full breed list from `/breeds/list/all`. */
  list: () => [...breedKeys.all, 'list'] as const,
};
