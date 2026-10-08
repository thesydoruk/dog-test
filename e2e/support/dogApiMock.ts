import type { Page, Route } from '@playwright/test';
import { BREED_LIST, imagesOfBreed, MAIN_DOG, THUMBNAILS } from './fixtures';

type Behaviour = 'success' | 'error';

const RANDOM_DOG = 'https://dog.ceo/api/breeds/image/random';
const RANDOM_DOGS = /^https:\/\/dog\.ceo\/api\/breeds\/image\/random\/(\d+)$/;
const BREED_LIST_URL = 'https://dog.ceo/api/breeds/list/all';
// /breed/{breed}[/{sub}]/images[/random[/{count}]]
const BREED_IMAGES =
  /^https:\/\/dog\.ceo\/api\/breed\/([a-z0-9]+)(?:\/([a-z0-9]+))?\/images(\/random(?:\/(\d+))?)?$/;
const IMAGES = 'https://images.dog.ceo/**';

const COLORS = ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#6d597a', '#457b9d'];

/** A tiny, deterministic stand-in for a dog photo, labelled with the breed slug. */
function placeholderSvg(url: string): string {
  const slug = /\/breeds\/([^/]+)\//.exec(url)?.[1] ?? 'dog';
  const color = COLORS[slug.length % COLORS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${color}"/>
    <text x="400" y="320" font-family="sans-serif" font-size="56" fill="#fff" text-anchor="middle">${slug}</text>
  </svg>`;
}

/** Thrown by a responder to answer with the API's own error shape. */
class ApiFailure {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

/**
 * Intercepts the Dog API and image CDN so e2e tests are fast and deterministic.
 * Tests can switch endpoints to failing, hold responses to observe loading
 * states, and break individual images.
 */
export class DogApiMock {
  readonly requests = { randomDog: 0, randomDogs: 0, breeds: 0, breedImages: 0 };

  private behaviour: Record<keyof DogApiMock['requests'], Behaviour> = {
    randomDog: 'success',
    randomDogs: 'success',
    breeds: 'success',
    breedImages: 'success',
  };
  private brokenImages = new Set<string>();
  private queuedThumbnails: (readonly string[])[] = [];
  private gate: Promise<void> | null = null;

  constructor(private readonly page: Page) {}

  async install(): Promise<void> {
    await this.page.route(RANDOM_DOG, (route) =>
      this.respond(route, 'randomDog', () => MAIN_DOG.url),
    );
    await this.page.route(RANDOM_DOGS, (route) => {
      const count = Number(RANDOM_DOGS.exec(route.request().url())?.[1]);
      return this.respond(route, 'randomDogs', () => {
        const urls = this.queuedThumbnails.shift() ?? THUMBNAILS.map((dog) => dog.url);
        return urls.slice(0, count);
      });
    });
    await this.page.route(BREED_LIST_URL, (route) =>
      this.respond(route, 'breeds', () => BREED_LIST),
    );
    await this.page.route(BREED_IMAGES, (route) => {
      const [, breed = '', subBreed, random, count] =
        BREED_IMAGES.exec(route.request().url()) ?? [];
      return this.respond(route, 'breedImages', () => {
        const subBreeds = BREED_LIST[breed];
        if (!subBreeds) throw new ApiFailure(404, 'Breed not found (main breed does not exist)');
        if (subBreed && !subBreeds.includes(subBreed)) {
          throw new ApiFailure(404, 'Breed not found (sub breed does not exist)');
        }
        const urls = imagesOfBreed(breed, subBreed);
        if (!random) return urls;
        return count ? urls.slice(0, Number(count)) : (urls[0] ?? '');
      });
    });
    await this.page.route(IMAGES, (route) => {
      const url = route.request().url();
      return this.brokenImages.has(url)
        ? route.fulfill({ status: 404, body: 'Not found' })
        : route.fulfill({ contentType: 'image/svg+xml', body: placeholderSvg(url) });
    });
  }

  setRandomDog(behaviour: Behaviour): void {
    this.behaviour.randomDog = behaviour;
  }

  setRandomDogs(behaviour: Behaviour): void {
    this.behaviour.randomDogs = behaviour;
  }

  setBreeds(behaviour: Behaviour): void {
    this.behaviour.breeds = behaviour;
  }

  setBreedImages(behaviour: Behaviour): void {
    this.behaviour.breedImages = behaviour;
  }

  breakImage(url: string): void {
    this.brokenImages.add(url);
  }

  /** Serves these URLs for the next thumbnails request instead of the default set. */
  queueThumbnails(urls: readonly string[]): void {
    this.queuedThumbnails.push(urls);
  }

  /** Holds every API response until the returned function is called. */
  holdResponses(): () => void {
    let release!: () => void;
    this.gate = new Promise((resolve) => (release = resolve));
    return () => {
      this.gate = null;
      release();
    };
  }

  private async respond(
    route: Route,
    endpoint: keyof DogApiMock['requests'],
    message: () => unknown,
  ): Promise<void> {
    this.requests[endpoint] += 1;
    if (this.gate) await this.gate;

    if (this.behaviour[endpoint] === 'error') {
      await route.fulfill({
        status: 500,
        json: { status: 'error', message: 'Internal server error', code: 500 },
      });
      return;
    }
    try {
      await route.fulfill({ json: { status: 'success', message: message() } });
    } catch (error) {
      if (!(error instanceof ApiFailure)) throw error;
      await route.fulfill({
        status: error.status,
        json: { status: 'error', message: error.message, code: error.status },
      });
    }
  }
}
