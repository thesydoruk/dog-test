import { expect, type Locator, type Page } from '@playwright/test';

export class DogViewerPage {
  readonly heading: Locator;
  readonly featured: Locator;
  readonly mainImage: Locator;
  readonly mainBreed: Locator;
  readonly favoriteToggle: Locator;
  readonly moreDogs: Locator;
  readonly thumbnails: Locator;
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
    this.thumbnails = this.moreDogs.getByRole('listitem').getByRole('button');
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
