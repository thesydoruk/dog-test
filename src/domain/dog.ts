import { breedFromImageUrl, type Breed } from './breed';

/**
 * One dog photo with its breed. The unit everything in the app works with: the main image,
 * thumbnails and favorites are all `Dog`s.
 *
 * Create one with {@link createDog}; validate untrusted data (e.g. from `localStorage`) with
 * {@link isDog}.
 */
export interface Dog {
  /** Unique id. The image URL is unique per photo, so it doubles as the id. */
  id: string;
  /** Full URL of the photo on `images.dog.ceo`. */
  imageUrl: string;
  /** Breed derived from the image URL. */
  breed: Breed;
}

/**
 * Builds a {@link Dog} from a Dog API image URL.
 *
 * @param imageUrl - A URL like `https://images.dog.ceo/breeds/pug/n02110958_1975.jpg`.
 * @returns The dog; its breed is parsed from the URL (or "Unknown breed").
 *
 * @example
 * ```ts
 * createDog('https://images.dog.ceo/breeds/hound-afghan/a.jpg').breed.name; // 'Afghan Hound'
 * ```
 */
export function createDog(imageUrl: string): Dog {
  return { id: imageUrl, imageUrl, breed: breedFromImageUrl(imageUrl) };
}

/**
 * Type guard for data that claims to be a {@link Dog}, such as favorites read from storage.
 *
 * Checks the shape only (string `id`, `imageUrl`, `breed.slug`, `breed.name`), not that the URL
 * actually points to a dog.
 */
export function isDog(value: unknown): value is Dog {
  if (typeof value !== 'object' || value === null) return false;
  const dog = value as Record<string, unknown>;
  const breed = dog.breed as Record<string, unknown> | null | undefined;
  return (
    typeof dog.id === 'string' &&
    typeof dog.imageUrl === 'string' &&
    typeof breed === 'object' &&
    breed !== null &&
    typeof breed.slug === 'string' &&
    typeof breed.name === 'string'
  );
}
