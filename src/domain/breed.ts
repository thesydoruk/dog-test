export interface Breed {
  /** Breed slug as used by the Dog API, e.g. `hound-afghan`. */
  slug: string;
  /** Human-readable name, e.g. `Afghan Hound`. */
  name: string;
}

export const UNKNOWN_BREED: Breed = { slug: 'unknown', name: 'Unknown breed' };

const BREED_FROM_URL = /\/breeds\/([a-z0-9]+(?:-[a-z0-9]+)*)\//i;

/** Extracts the breed slug from a Dog API image URL, or `null` when it can't be found. */
export function parseBreedSlug(imageUrl: string): string | null {
  const match = BREED_FROM_URL.exec(imageUrl);
  return match?.[1]?.toLowerCase() ?? null;
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Turns a Dog API slug into a display name. Sub-breeds come after the main breed
 * in the slug (`hound-afghan`), but read naturally before it (`Afghan Hound`).
 */
export function formatBreedName(slug: string): string {
  return slug.split('-').filter(Boolean).reverse().map(capitalize).join(' ');
}

export function breedFromImageUrl(imageUrl: string): Breed {
  const slug = parseBreedSlug(imageUrl);
  return slug ? { slug, name: formatBreedName(slug) } : UNKNOWN_BREED;
}
