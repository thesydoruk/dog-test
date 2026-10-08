import { http, HttpResponse } from 'msw';
import { createDog } from '@/domain/dog';
import { AFGHAN_HOUND_URLS, MAIN_DOG_URL, mainDog, thumbnailDogs } from '@/test/fixtures';
import {
  apiError,
  breedListUrl,
  randomDogsUrl,
  randomDogUrl,
  server,
  subBreedRandomUrl,
} from '@/test/server';
import {
  DogApiError,
  fetchBreedImages,
  fetchBreeds,
  fetchRandomDog,
  fetchRandomDogs,
  fetchRandomDogsByBreed,
  MAX_RANDOM_DOGS,
} from '../dogApi';

const afghanDogs = AFGHAN_HOUND_URLS.map(createDog);

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

describe('fetchBreeds', () => {
  it('returns the parsed catalog', async () => {
    const breeds = await fetchBreeds();

    expect(breeds.map((b) => b.slug)).toEqual(['beagle', 'bulldog', 'hound', 'pug']);
    expect(breeds[1]?.subBreeds.map((s) => s.name)).toEqual([
      'Boston Bulldog',
      'English Bulldog',
      'French Bulldog',
    ]);
  });

  it('throws a DogApiError on failure', async () => {
    server.use(http.get(breedListUrl, () => apiError()));

    await expect(fetchBreeds()).rejects.toBeInstanceOf(DogApiError);
  });
});

describe('fetchRandomDogsByBreed', () => {
  it('fetches random dogs of a main breed', async () => {
    await expect(fetchRandomDogsByBreed({ breed: 'hound' }, 2)).resolves.toEqual(
      afghanDogs.slice(0, 2),
    );
  });

  it('fetches random dogs of a sub-breed', async () => {
    let requestedPath: string | undefined;
    server.use(
      http.get(subBreedRandomUrl, ({ request }) => {
        requestedPath = new URL(request.url).pathname;
        return HttpResponse.json({ status: 'success', message: AFGHAN_HOUND_URLS });
      }),
    );

    await expect(
      fetchRandomDogsByBreed({ breed: 'hound', subBreed: 'afghan' }, 3),
    ).resolves.toEqual(afghanDogs);
    expect(requestedPath).toBe('/api/breed/hound/afghan/images/random/3');
  });

  it('surfaces the API "breed not found" error', async () => {
    await expect(fetchRandomDogsByBreed({ breed: 'dragon' }, 1)).rejects.toMatchObject({
      name: 'DogApiError',
      status: 404,
      message: /Breed not found/,
    });
  });

  it.each([0, MAX_RANDOM_DOGS + 1])('rejects count %s', async (count) => {
    await expect(fetchRandomDogsByBreed({ breed: 'hound' }, count)).rejects.toThrow(RangeError);
  });

  it.each([
    [{ breed: 'hound/afghan' }],
    [{ breed: '../breeds' }],
    [{ breed: 'Hound' }],
    [{ breed: 'hound', subBreed: 'af ghan' }],
    [{ breed: '' }],
  ])('refuses to build a path from %j', async (ref) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(fetchRandomDogsByBreed(ref, 1)).rejects.toThrow(/Invalid breed/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('fetchBreedImages', () => {
  it('returns every photo of a main breed', async () => {
    await expect(fetchBreedImages({ breed: 'hound' })).resolves.toEqual(afghanDogs);
  });

  it('returns every photo of a sub-breed', async () => {
    await expect(fetchBreedImages({ breed: 'hound', subBreed: 'afghan' })).resolves.toEqual(
      afghanDogs,
    );
  });

  it('surfaces the API "breed not found" error', async () => {
    await expect(fetchBreedImages({ breed: 'hound', subBreed: 'dragon' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('refuses invalid slugs without calling the API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(fetchBreedImages({ breed: 'hound', subBreed: '../x' })).rejects.toThrow(
      RangeError,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
