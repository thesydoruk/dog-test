import { breedFromImageUrl, type Breed } from './breed';

export interface Dog {
  /** The image URL is unique per photo, so it doubles as the id. */
  id: string;
  imageUrl: string;
  breed: Breed;
}

export function createDog(imageUrl: string): Dog {
  return { id: imageUrl, imageUrl, breed: breedFromImageUrl(imageUrl) };
}

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
