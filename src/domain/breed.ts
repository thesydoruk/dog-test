/**
 * A dog breed as the app shows it.
 *
 * The random endpoints return only image URLs, so breeds are usually derived from the URL with
 * {@link breedFromImageUrl}.
 */
export interface Breed {
  /**
   * Breed slug as used by the Dog API: the main breed, then the sub-breed, joined by `-`.
   * @example 'pug', 'hound-afghan'
   */
  slug: string;
  /**
   * Human-readable name, sub-breed first.
   * @example 'Pug', 'Afghan Hound'
   */
  name: string;
}

/** Stand-in used when an image URL has no recognisable breed in it. */
export const UNKNOWN_BREED: Breed = { slug: 'unknown', name: 'Unknown breed' };

/** Matches the `/breeds/{slug}/` segment of a Dog API image URL. */
const BREED_FROM_URL = /\/breeds\/([a-z0-9]+(?:-[a-z0-9]+)*)\//i;

/**
 * Extracts the breed slug from a Dog API image URL.
 *
 * @param imageUrl - A URL like `https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg`.
 * @returns The lower-cased slug (`hound-afghan`), or `null` when the URL has no breed segment.
 *
 * @example
 * ```ts
 * parseBreedSlug('https://images.dog.ceo/breeds/pug/a.jpg'); // 'pug'
 * parseBreedSlug('https://example.com/dog.jpg');             // null
 * ```
 */
export function parseBreedSlug(imageUrl: string): string | null {
  const match = BREED_FROM_URL.exec(imageUrl);
  return match?.[1]?.toLowerCase() ?? null;
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Turns a Dog API slug into a display name.
 *
 * Sub-breeds come after the main breed in the slug (`hound-afghan`) but read naturally before it,
 * so the parts are reversed and capitalised.
 *
 * @param slug - A breed slug such as `pug` or `spaniel-cocker-english`.
 * @returns The display name, e.g. `English Cocker Spaniel`.
 *
 * @example
 * ```ts
 * formatBreedName('hound-afghan');      // 'Afghan Hound'
 * formatBreedName('retriever-golden');  // 'Golden Retriever'
 * ```
 */
export function formatBreedName(slug: string): string {
  return slug.split('-').filter(Boolean).reverse().map(capitalize).join(' ');
}

/**
 * Derives the breed of a dog photo from its URL.
 *
 * @param imageUrl - A Dog API image URL.
 * @returns The breed, or {@link UNKNOWN_BREED} when the URL doesn't contain one.
 */
export function breedFromImageUrl(imageUrl: string): Breed {
  const slug = parseBreedSlug(imageUrl);
  return slug ? { slug, name: formatBreedName(slug) } : UNKNOWN_BREED;
}
