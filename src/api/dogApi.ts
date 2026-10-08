import {
  isValidBreedSlug,
  parseBreedList,
  type BreedRef,
  type BreedWithSubBreeds,
  type RawBreedList,
} from '@/domain/breedCatalog';
import { createDog, type Dog } from '@/domain/dog';

export const DOG_API_BASE_URL = 'https://dog.ceo/api';
/** The documented cap for the `.../random/:count` endpoints. */
export const MAX_RANDOM_DOGS = 50;

interface DogApiResponse<T> {
  status: 'success' | 'error';
  message: T;
  code?: number;
}

export class DogApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'DogApiError';
    this.status = status;
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${DOG_API_BASE_URL}${path}`, { signal });

  let body: DogApiResponse<T> | undefined;
  try {
    body = (await response.json()) as DogApiResponse<T>;
  } catch {
    body = undefined;
  }

  if (!response.ok || body?.status !== 'success') {
    const reason = typeof body?.message === 'string' ? body.message : response.statusText;
    throw new DogApiError(reason || 'Request to the Dog API failed', response.status);
  }

  return body.message;
}

function assertCount(count: number): void {
  if (!Number.isInteger(count) || count < 1 || count > MAX_RANDOM_DOGS) {
    throw new RangeError(`count must be an integer between 1 and ${MAX_RANDOM_DOGS}`);
  }
}

/** `/breed/hound` or `/breed/hound/afghan`; slugs are validated so they can't alter the path. */
function breedPath({ breed, subBreed }: BreedRef): string {
  if (!isValidBreedSlug(breed) || (subBreed !== undefined && !isValidBreedSlug(subBreed))) {
    throw new RangeError(`Invalid breed: ${breed}${subBreed ? `/${subBreed}` : ''}`);
  }
  return subBreed ? `/breed/${breed}/${subBreed}` : `/breed/${breed}`;
}

export async function fetchRandomDog(signal?: AbortSignal): Promise<Dog> {
  const imageUrl = await request<string>('/breeds/image/random', signal);
  return createDog(imageUrl);
}

export async function fetchRandomDogs(count: number, signal?: AbortSignal): Promise<Dog[]> {
  assertCount(count);
  const imageUrls = await request<string[]>(`/breeds/image/random/${count}`, signal);
  return imageUrls.map(createDog);
}

/** All 100+ breeds with their sub-breeds. Changes rarely, so cache it for the session. */
export async function fetchBreeds(signal?: AbortSignal): Promise<BreedWithSubBreeds[]> {
  const raw = await request<RawBreedList>('/breeds/list/all', signal);
  return parseBreedList(raw);
}

export async function fetchRandomDogsByBreed(
  ref: BreedRef,
  count: number,
  signal?: AbortSignal,
): Promise<Dog[]> {
  assertCount(count);
  const imageUrls = await request<string[]>(`${breedPath(ref)}/images/random/${count}`, signal);
  return imageUrls.map(createDog);
}

/** Every photo of a breed (can be hundreds); page it on the client. */
export async function fetchBreedImages(ref: BreedRef, signal?: AbortSignal): Promise<Dog[]> {
  const imageUrls = await request<string[]>(`${breedPath(ref)}/images`, signal);
  return imageUrls.map(createDog);
}
