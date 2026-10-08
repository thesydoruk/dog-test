import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DOG_API_BASE_URL } from '@/api/dogApi';
import { MAIN_DOG_URL, THUMBNAIL_URLS } from './fixtures';

export const randomDogUrl = `${DOG_API_BASE_URL}/breeds/image/random`;
export const randomDogsUrl = `${DOG_API_BASE_URL}/breeds/image/random/:count`;

export const success = <T>(message: T) => HttpResponse.json({ status: 'success', message });

export const apiError = (status = 500, message = 'Something went wrong') =>
  HttpResponse.json({ status: 'error', message, code: status }, { status });

export const handlers = [
  http.get(randomDogUrl, () => success(MAIN_DOG_URL)),
  http.get(randomDogsUrl, ({ params }) => success(THUMBNAIL_URLS.slice(0, Number(params.count)))),
];

export const server = setupServer(...handlers);
