import { formatBreedName, type Breed } from './breed';

/**
 * A main breed from `/breeds/list/all` together with its sub-breeds.
 *
 * @example
 * ```ts
 * {
 *   slug: 'hound',
 *   name: 'Hound',
 *   subBreeds: [{ slug: 'hound-afghan', name: 'Afghan Hound' }, …],
 * }
 * ```
 */
export interface BreedWithSubBreeds extends Breed {
  /** Sub-breeds with slugs in image-URL form (`hound-afghan`); empty for most breeds. */
  subBreeds: Breed[];
}

/**
 * Raw shape of the Dog API breed list: main breed → sub-breed slugs.
 * @example `{ hound: ['afghan', 'basset'], pug: [] }`
 */
export type RawBreedList = Record<string, string[]>;

/**
 * Identifies a breed or sub-breed for the `/breed/...` endpoints.
 *
 * Build one from a slug with {@link breedRefFromSlug}.
 */
export interface BreedRef {
  /** Main breed slug, e.g. `hound`. */
  breed: string;
  /** Sub-breed slug without the main breed, e.g. `afghan`. Omit for the whole breed. */
  subBreed?: string;
}

const SLUG = /^[a-z0-9]+$/;

/**
 * Whether `value` is a single breed or sub-breed slug: lower-case letters and digits only.
 *
 * Used to reject anything that could alter a URL path (`/`, `..`, spaces) before it reaches the
 * API. Note that combined slugs like `hound-afghan` are not valid here; split them first.
 */
export function isValidBreedSlug(value: string): boolean {
  return SLUG.test(value);
}

/**
 * Joins a breed and sub-breed into the slug used in image URLs.
 *
 * Using the same form as the URLs means a dog built from a photo and a breed picked from the
 * catalog compare equal by slug.
 *
 * @example
 * ```ts
 * subBreedSlug('hound', 'afghan'); // 'hound-afghan'
 * ```
 */
export function subBreedSlug(breed: string, subBreed: string): string {
  return `${breed}-${subBreed}`;
}

/**
 * Turns the raw `/breeds/list/all` payload into breeds with display names.
 *
 * Entries that are not valid slugs are dropped, and a malformed sub-breed list is treated as
 * empty, so a bad payload degrades instead of crashing the app.
 *
 * @param raw - The `message` of the `/breeds/list/all` response.
 * @returns Breeds in payload order, each with its sub-breeds.
 */
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

/**
 * Splits a catalog or image-URL slug back into a {@link BreedRef}.
 *
 * Everything after the first `-` is the sub-breed.
 *
 * @example
 * ```ts
 * breedRefFromSlug('pug');                     // { breed: 'pug' }
 * breedRefFromSlug('hound-afghan');            // { breed: 'hound', subBreed: 'afghan' }
 * breedRefFromSlug(dog.breed.slug);            // ref for "more dogs like this one"
 * ```
 */
export function breedRefFromSlug(slug: string): BreedRef {
  const [breed = '', ...rest] = slug.split('-');
  return rest.length ? { breed, subBreed: rest.join('-') } : { breed };
}
