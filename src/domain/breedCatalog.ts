import { formatBreedName, type Breed } from './breed';

/** A main breed from `/breeds/list/all` together with its sub-breeds, if any. */
export interface BreedWithSubBreeds extends Breed {
  subBreeds: Breed[];
}

/** Raw shape of the Dog API breed list: `{ hound: ['afghan', 'basset'], pug: [] }`. */
export type RawBreedList = Record<string, string[]>;

/** Identifies a breed or sub-breed for the `/breed/...` endpoints. */
export interface BreedRef {
  breed: string;
  subBreed?: string;
}

const SLUG = /^[a-z0-9]+$/;

export function isValidBreedSlug(value: string): boolean {
  return SLUG.test(value);
}

/**
 * Sub-breed slugs mirror the image URLs (`hound-afghan`), so a dog built from an image URL and
 * a breed picked from the catalog compare equal by slug.
 */
export function subBreedSlug(breed: string, subBreed: string): string {
  return `${breed}-${subBreed}`;
}

export function parseBreedList(raw: RawBreedList): BreedWithSubBreeds[] {
  return Object.entries(raw)
    .filter(([breed]) => isValidBreedSlug(breed))
    .map(([breed, subBreeds]) => ({
      slug: breed,
      name: formatBreedName(breed),
      subBreeds: (Array.isArray(subBreeds) ? subBreeds : []).filter(isValidBreedSlug).map((sub) => {
        const slug = subBreedSlug(breed, sub);
        return { slug, name: formatBreedName(slug) };
      }),
    }));
}

/** Splits a catalog or image-URL slug (`hound-afghan`) back into a `BreedRef`. */
export function breedRefFromSlug(slug: string): BreedRef {
  const [breed = '', ...rest] = slug.split('-');
  return rest.length ? { breed, subBreed: rest.join('-') } : { breed };
}
