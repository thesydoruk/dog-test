import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DOG_API_BASE_URL } from '@/api/dogApi';
import { AFGHAN_HOUND_URLS, MAIN_DOG_URL, RAW_BREED_LIST, THUMBNAIL_URLS } from './fixtures';

export const randomDogUrl = `${DOG_API_BASE_URL}/breeds/image/random`;
export const randomDogsUrl = `${DOG_API_BASE_URL}/breeds/image/random/:count`;
export const breedListUrl = `${DOG_API_BASE_URL}/breeds/list/all`;
export const breedImagesUrl = `${DOG_API_BASE_URL}/breed/:breed/images`;
export const subBreedImagesUrl = `${DOG_API_BASE_URL}/breed/:breed/:subBreed/images`;
export const breedRandomUrl = `${DOG_API_BASE_URL}/breed/:breed/images/random/:count`;
export const subBreedRandomUrl = `${DOG_API_BASE_URL}/breed/:breed/:subBreed/images/random/:count`;

export const success = <T>(message: T) => HttpResponse.json({ status: 'success', message });

export const apiError = (status = 500, message = 'Something went wrong') =>
  HttpResponse.json({ status: 'error', message, code: status }, { status });

export const breedNotFound = () => apiError(404, 'Breed not found (main breed does not exist)');

export const handlers = [
  http.get(randomDogUrl, () => success(MAIN_DOG_URL)),
  http.get(randomDogsUrl, ({ params }) => success(THUMBNAIL_URLS.slice(0, Number(params.count)))),
  http.get(breedListUrl, () => success(RAW_BREED_LIST)),
  // The fixture catalog only has photos for Afghan Hounds; anything else is unknown.
  http.get(subBreedImagesUrl, ({ params }) =>
    params.breed === 'hound' && params.subBreed === 'afghan'
      ? success(AFGHAN_HOUND_URLS)
      : breedNotFound(),
  ),
  http.get(breedImagesUrl, ({ params }) =>
    params.breed === 'hound' ? success(AFGHAN_HOUND_URLS) : breedNotFound(),
  ),
  http.get(subBreedRandomUrl, ({ params }) =>
    params.breed === 'hound' && params.subBreed === 'afghan'
      ? success(AFGHAN_HOUND_URLS.slice(0, Number(params.count)))
      : breedNotFound(),
  ),
  http.get(breedRandomUrl, ({ params }) =>
    params.breed === 'hound'
      ? success(AFGHAN_HOUND_URLS.slice(0, Number(params.count)))
      : breedNotFound(),
  ),
];

export const server = setupServer(...handlers);
