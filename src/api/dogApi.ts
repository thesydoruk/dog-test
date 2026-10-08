import { createDog, type Dog } from '@/domain/dog';

export const DOG_API_BASE_URL = 'https://dog.ceo/api';
/** The Dog API caps `/breeds/image/random/:count` at 50 images. */
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

export async function fetchRandomDog(signal?: AbortSignal): Promise<Dog> {
  const imageUrl = await request<string>('/breeds/image/random', signal);
  return createDog(imageUrl);
}

export async function fetchRandomDogs(count: number, signal?: AbortSignal): Promise<Dog[]> {
  if (!Number.isInteger(count) || count < 1 || count > MAX_RANDOM_DOGS) {
    throw new RangeError(`count must be an integer between 1 and ${MAX_RANDOM_DOGS}`);
  }
  const imageUrls = await request<string[]>(`/breeds/image/random/${count}`, signal);
  return imageUrls.map(createDog);
}
