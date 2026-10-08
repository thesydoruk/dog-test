import { http, HttpResponse } from 'msw';
import { MAIN_DOG_URL, mainDog, thumbnailDogs } from '@/test/fixtures';
import { apiError, randomDogsUrl, randomDogUrl, server } from '@/test/server';
import { DogApiError, fetchRandomDog, fetchRandomDogs, MAX_RANDOM_DOGS } from './dogApi';

describe('fetchRandomDog', () => {
  it('returns a dog built from the image URL', async () => {
    await expect(fetchRandomDog()).resolves.toEqual(mainDog);
  });

  it('throws a DogApiError with the API message on an HTTP error', async () => {
    server.use(http.get(randomDogUrl, () => apiError(404, 'Breed not found')));

    const error = await fetchRandomDog().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DogApiError);
    expect(error).toMatchObject({ message: 'Breed not found', status: 404 });
  });

  it('throws when the API reports an error with a 200 status', async () => {
    server.use(
      http.get(randomDogUrl, () => HttpResponse.json({ status: 'error', message: 'Nope' })),
    );

    await expect(fetchRandomDog()).rejects.toMatchObject({ message: 'Nope', status: 200 });
  });

  it('uses the status text when the body is not JSON', async () => {
    server.use(
      http.get(
        randomDogUrl,
        () => new HttpResponse('<html>', { status: 502, statusText: 'Bad Gateway' }),
      ),
    );

    await expect(fetchRandomDog()).rejects.toMatchObject({ message: 'Bad Gateway', status: 502 });
  });

  it('falls back to a generic message when nothing else is available', async () => {
    // MSW always fills in a default status text, so stub fetch directly.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

    await expect(fetchRandomDog()).rejects.toThrow('Request to the Dog API failed');
  });

  it('propagates network errors', async () => {
    server.use(http.get(randomDogUrl, () => HttpResponse.error()));

    await expect(fetchRandomDog()).rejects.toThrow(TypeError);
  });

  it('supports aborting the request', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(fetchRandomDog(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('fetchRandomDogs', () => {
  it('requests the given number of dogs', async () => {
    let requestedCount: string | undefined;
    server.use(
      http.get(randomDogsUrl, ({ params }) => {
        requestedCount = params.count as string;
        return HttpResponse.json({ status: 'success', message: [MAIN_DOG_URL] });
      }),
    );

    await expect(fetchRandomDogs(1)).resolves.toEqual([mainDog]);
    expect(requestedCount).toBe('1');
  });

  it('maps every URL to a dog', async () => {
    await expect(fetchRandomDogs(10)).resolves.toEqual(thumbnailDogs);
  });

  it.each([0, -1, 1.5, MAX_RANDOM_DOGS + 1, Number.NaN])('rejects count %s', async (count) => {
    await expect(fetchRandomDogs(count)).rejects.toThrow(RangeError);
  });

  it('throws a DogApiError on failure', async () => {
    server.use(http.get(randomDogsUrl, () => apiError()));

    await expect(fetchRandomDogs(10)).rejects.toBeInstanceOf(DogApiError);
  });
});
