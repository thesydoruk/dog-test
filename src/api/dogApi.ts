/**
 * Typed client for the public Dog API (https://dog.ceo/dog-api/documentation).
 *
 * Every function returns domain objects ({@link Dog}, {@link BreedWithSubBreeds}) rather than the
 * raw `{ status, message }` envelope, accepts an optional `AbortSignal` (TanStack Query passes
 * one so stale requests are cancelled) and throws {@link DogApiError} when the API fails.
 *
 * @module
 */
import {
  isValidBreedSlug,
  parseBreedList,
  type BreedRef,
  type BreedWithSubBreeds,
  type RawBreedList,
} from '@/domain/breedCatalog';
import { createDog, type Dog } from '@/domain/dog';

/** Base URL of the Dog API; every endpoint path is appended to it. */
export const DOG_API_BASE_URL = 'https://dog.ceo/api';

/**
 * The documented cap for the `.../random/:count` endpoints.
 *
 * @remarks The live API currently returns more than 50 when asked, but the docs promise only 50,
 * so the client enforces the documented limit.
 */
export const MAX_RANDOM_DOGS = 50;

/** Envelope the Dog API wraps every response in. On errors `message` is a human-readable reason. */
interface DogApiResponse<T> {
  status: 'success' | 'error';
  message: T;
  /** HTTP-like status code, present on error responses (e.g. `404` for an unknown breed). */
  code?: number;
}

/**
 * Thrown when the Dog API responds with an HTTP error, a non-JSON body or `status: "error"`.
 *
 * Network failures and aborted requests are not wrapped: they surface as the `TypeError` /
 * `AbortError` thrown by `fetch` itself.
 *
 * @example
 * ```ts
 * try {
 *   await fetchBreedImages({ breed: 'dragon' });
 * } catch (error) {
 *   if (error instanceof DogApiError && error.status === 404) showBreedNotFound();
 * }
 * ```
 */
export class DogApiError extends Error {
  /** HTTP status of the failed response, e.g. `404` for an unknown breed or `500` for an outage. */
  readonly status?: number;

  /**
   * @param message - Reason reported by the API, or the HTTP status text as a fallback.
   * @param status - HTTP status code of the failed response.
   */
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'DogApiError';
    this.status = status;
  }
}

/**
 * Fetches `path` from the Dog API and unwraps the `message` of a successful response.
 *
 * @throws {@link DogApiError} on a non-2xx status, an unparsable body or `status: "error"`.
 */
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

/** @throws `RangeError` unless `count` is an integer from 1 to {@link MAX_RANDOM_DOGS}. */
function assertCount(count: number): void {
  if (!Number.isInteger(count) || count < 1 || count > MAX_RANDOM_DOGS) {
    throw new RangeError(`count must be an integer between 1 and ${MAX_RANDOM_DOGS}`);
  }
}

/**
 * Builds `/breed/hound` or `/breed/hound/afghan`.
 *
 * Slugs are validated first so a value like `../breeds` can never change which endpoint is hit.
 *
 * @throws `RangeError` when the breed or sub-breed is not a valid slug.
 */
function breedPath({ breed, subBreed }: BreedRef): string {
  if (!isValidBreedSlug(breed) || (subBreed !== undefined && !isValidBreedSlug(subBreed))) {
    throw new RangeError(`Invalid breed: ${breed}${subBreed ? `/${subBreed}` : ''}`);
  }
  return subBreed ? `/breed/${breed}/${subBreed}` : `/breed/${breed}`;
}

/**
 * Fetches one random dog of any breed.
 *
 * Endpoint: `GET /breeds/image/random`.
 *
 * @param signal - Cancels the request when aborted.
 * @returns The dog, with its breed parsed from the image URL.
 * @throws {@link DogApiError} when the API fails.
 */
export async function fetchRandomDog(signal?: AbortSignal): Promise<Dog> {
  const imageUrl = await request<string>('/breeds/image/random', signal);
  return createDog(imageUrl);
}

/**
 * Fetches several random dogs of any breed.
 *
 * Endpoint: `GET /breeds/image/random/{count}`. The API may return the same photo twice.
 *
 * @param count - How many dogs to fetch, 1 to {@link MAX_RANDOM_DOGS}.
 * @param signal - Cancels the request when aborted.
 * @returns The dogs in the order the API returned them.
 * @throws `RangeError` when `count` is out of range (no request is made).
 * @throws {@link DogApiError} when the API fails.
 */
export async function fetchRandomDogs(count: number, signal?: AbortSignal): Promise<Dog[]> {
  assertCount(count);
  const imageUrls = await request<string[]>(`/breeds/image/random/${count}`, signal);
  return imageUrls.map(createDog);
}

/**
 * Fetches the full breed catalog: 100+ breeds, each with its sub-breeds.
 *
 * Endpoint: `GET /breeds/list/all`. The list changes rarely, so cache it for the session
 * (`staleTime: Infinity` under {@link breedKeys}.list()).
 *
 * @param signal - Cancels the request when aborted.
 * @returns Breeds in API order, with display names already formatted.
 * @throws {@link DogApiError} when the API fails.
 *
 * @example
 * ```ts
 * const breeds = await fetchBreeds();
 * breeds.find((b) => b.slug === 'hound')?.subBreeds;
 * // → [{ slug: 'hound-afghan', name: 'Afghan Hound' }, …]
 * ```
 */
export async function fetchBreeds(signal?: AbortSignal): Promise<BreedWithSubBreeds[]> {
  const raw = await request<RawBreedList>('/breeds/list/all', signal);
  return parseBreedList(raw);
}

/**
 * Fetches random dogs of one breed or sub-breed.
 *
 * Endpoint: `GET /breed/{breed}[/{subBreed}]/images/random/{count}`.
 *
 * @param ref - The breed, optionally narrowed to a sub-breed.
 * @param count - How many dogs to fetch, 1 to {@link MAX_RANDOM_DOGS}.
 * @param signal - Cancels the request when aborted.
 * @returns Up to `count` dogs (fewer if the breed has fewer photos).
 * @throws `RangeError` for an invalid slug or `count` (no request is made).
 * @throws {@link DogApiError} with `status: 404` for an unknown breed, or on any other failure.
 *
 * @example
 * ```ts
 * await fetchRandomDogsByBreed({ breed: 'hound', subBreed: 'afghan' }, 10);
 * ```
 */
export async function fetchRandomDogsByBreed(
  ref: BreedRef,
  count: number,
  signal?: AbortSignal,
): Promise<Dog[]> {
  assertCount(count);
  const imageUrls = await request<string[]>(`${breedPath(ref)}/images/random/${count}`, signal);
  return imageUrls.map(createDog);
}

/**
 * Fetches every photo of a breed or sub-breed.
 *
 * Endpoint: `GET /breed/{breed}[/{subBreed}]/images`. A main breed includes the photos of all its
 * sub-breeds and can return hundreds of URLs (hound: 800+), so page or virtualise the result on
 * the client.
 *
 * @param ref - The breed, optionally narrowed to a sub-breed.
 * @param signal - Cancels the request when aborted.
 * @returns All dogs of that breed, in API order.
 * @throws `RangeError` for an invalid slug (no request is made).
 * @throws {@link DogApiError} with `status: 404` for an unknown breed, or on any other failure.
 */
export async function fetchBreedImages(ref: BreedRef, signal?: AbortSignal): Promise<Dog[]> {
  const imageUrls = await request<string[]>(`${breedPath(ref)}/images`, signal);
  return imageUrls.map(createDog);
}
