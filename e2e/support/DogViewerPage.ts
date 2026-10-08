import { expect, type Locator, type Page } from '@playwright/test';

export class DogViewerPage {
  readonly heading: Locator;
  readonly featured: Locator;
  readonly mainImage: Locator;
  readonly mainBreed: Locator;
  readonly favoriteToggle: Locator;
  readonly moreDogs: Locator;
  readonly newDogsButton: Locator;
  readonly thumbnails: Locator;
  readonly favoritesJumpLink: Locator;
  readonly announcer: Locator;
  readonly favorites: Locator;
  readonly favoriteItems: Locator;
  readonly favoritesCount: Locator;
  readonly emptyFavorites: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Dog Viewer' });
    this.featured = page.getByRole('region', { name: 'Featured dog' });
    this.mainImage = this.featured.getByRole('img');
    this.mainBreed = page.getByTestId('main-dog-breed');
    this.favoriteToggle = this.featured.getByRole('button', { name: /favorites$/ });
    this.moreDogs = page.getByRole('region', { name: 'More dogs' });
    this.newDogsButton = this.moreDogs.getByRole('button', { name: 'New dogs' });
    this.thumbnails = this.moreDogs.getByRole('listitem').getByRole('button');
    this.favoritesJumpLink = this.featured.getByRole('link', { name: /^Favorites \(\d+\)$/ });
    this.announcer = page.getByRole('status').filter({ hasText: /favorites$/ });
    this.favorites = page.getByRole('complementary', { name: /^Favorites/ });
    this.favoriteItems = this.favorites.getByRole('listitem');
    this.favoritesCount = page.getByTestId('favorites-count');
    this.emptyFavorites = this.favorites.getByText('No favorites yet.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Opens the app and waits until the main dog and every thumbnail are shown. */
  async open(): Promise<void> {
    await this.goto();
    await expect(this.mainBreed).toBeVisible();
    await expect(this.thumbnails).toHaveCount(10);
  }

  thumbnail(breed: string): Locator {
    return this.moreDogs.getByRole('button', { name: breed, exact: true });
  }

  favorite(breed: string): Locator {
    return this.favorites.getByRole('button', { name: breed, exact: true });
  }

  removeFavoriteButton(breed: string): Locator {
    return this.favorites.getByRole('button', { name: `Remove ${breed} from favorites` });
  }

  /** Picks a thumbnail and waits for the page to finish scrolling to the main image. */
  async pickThumbnail(breed: string): Promise<void> {
    await this.thumbnail(breed).click();
    await this.waitForScrollEnd();
  }

  async pickThumbnailAt(index: number): Promise<void> {
    await this.thumbnails.nth(index).click();
    await this.waitForScrollEnd();
  }

  /** Picks a favorite and waits for the page to finish scrolling to the main image. */
  async pickFavorite(breed: string): Promise<void> {
    await this.favorite(breed).click();
    await this.waitForScrollEnd();
  }

  /**
   * Picking a dog smooth-scrolls the main image into view. Clicking something else while
   * the page is still moving can land on the wrong element, so wait until it settles.
   */
  async waitForScrollEnd(): Promise<void> {
    await this.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const STABLE_FRAMES = 8;
          let last = window.scrollY;
          let stable = 0;
          const tick = () => {
            if (window.scrollY === last) {
              stable += 1;
              if (stable >= STABLE_FRAMES) return resolve();
            } else {
              stable = 0;
              last = window.scrollY;
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
  }

  async expectMainDog(breed: string, imageUrl: string): Promise<void> {
    await expect(this.mainBreed).toHaveText(breed);
    await expect(this.mainImage).toHaveAccessibleName(breed);
    await expect(this.mainImage).toHaveAttribute('src', imageUrl);
  }

  /** Width of the viewport the current project runs at. */
  get viewportWidth(): number {
    return this.page.viewportSize()?.width ?? 0;
  }
}
