import { byBreed, MAIN_DOG, THUMBNAIL_BREEDS, THUMBNAILS } from './support/fixtures';
import { expect, test } from './support/test';

test.describe('Part 1: general display', () => {
  test('shows a random dog labelled by its breed above 10 labelled thumbnails', async ({
    viewer,
  }) => {
    await viewer.open();

    await expect(viewer.heading).toBeVisible();
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
    await expect(viewer.mainImage).toBeVisible();
    await expect(viewer.thumbnails).toHaveText(THUMBNAIL_BREEDS);

    // The main image sits above the thumbnails.
    const main = await viewer.featured.boundingBox();
    const grid = await viewer.moreDogs.boundingBox();
    expect(main!.y + main!.height).toBeLessThanOrEqual(grid!.y);
  });

  test('actually renders the dog images', async ({ viewer }) => {
    await viewer.open();

    await expect
      .poll(() => viewer.mainImage.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);

    for (const [index, dog] of THUMBNAILS.entries()) {
      const image = viewer.thumbnails.nth(index).locator('img');
      await expect(image).toHaveAttribute('src', dog.url);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    }
  });

  test('shows loading placeholders until the dogs arrive', async ({ viewer, dogApi }) => {
    const release = dogApi.holdResponses();
    await viewer.goto();

    await expect(viewer.featured.getByRole('status')).toHaveText('Loading a dog…');
    await expect(viewer.moreDogs.getByRole('status')).toHaveText('Loading more dogs…');
    await expect(viewer.moreDogs.getByRole('status').locator('li')).toHaveCount(10);
    await expect(viewer.favoriteToggle).toHaveCount(0);

    release();

    await expect(viewer.page.getByRole('status')).toHaveCount(0);
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
    await expect(viewer.thumbnails).toHaveCount(10);
  });

  test('clicking a thumbnail shows it as the main image', async ({ viewer }) => {
    await viewer.open();
    await expect(viewer.thumbnails.and(viewer.page.locator('[aria-pressed="true"]'))).toHaveCount(
      0,
    );

    const pug = byBreed('Pug');
    await viewer.thumbnail(pug.breed).click();
    await viewer.expectMainDog(pug.breed, pug.url);
    await expect(viewer.thumbnail(pug.breed)).toHaveAttribute('aria-pressed', 'true');

    const beagle = byBreed('Beagle');
    await viewer.thumbnail(beagle.breed).click();
    await viewer.expectMainDog(beagle.breed, beagle.url);
    await expect(viewer.thumbnail(beagle.breed)).toHaveAttribute('aria-pressed', 'true');
    await expect(viewer.thumbnail(pug.breed)).toHaveAttribute('aria-pressed', 'false');
  });

  test('every thumbnail can become the main image', async ({ viewer }) => {
    await viewer.open();

    for (const dog of THUMBNAILS) {
      await viewer.thumbnail(dog.breed).click();
      await viewer.expectMainDog(dog.breed, dog.url);
    }
  });

  test('thumbnails can be chosen with the keyboard', async ({ viewer, page }) => {
    await viewer.open();

    const husky = byBreed('Husky');
    await viewer.thumbnail(husky.breed).focus();
    await page.keyboard.press('Enter');
    await viewer.expectMainDog(husky.breed, husky.url);

    const labrador = byBreed('Labrador');
    await viewer.thumbnail(labrador.breed).focus();
    await page.keyboard.press(' ');
    await viewer.expectMainDog(labrador.breed, labrador.url);
  });

  test('focus order follows the visual order', async ({ viewer, page }) => {
    await viewer.open();
    await viewer.heading.click();

    const focusedName = () =>
      page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');

    await page.keyboard.press('Tab');
    await expect(viewer.favoriteToggle).toBeFocused();

    for (const breed of THUMBNAIL_BREEDS) {
      await page.keyboard.press('Tab');
      expect(await focusedName()).toBe(breed);
    }
  });

  test('a broken image falls back to a labelled placeholder', async ({ viewer, dogApi }) => {
    dogApi.breakImage(MAIN_DOG.url);
    dogApi.breakImage(byBreed('Pug').url);
    await viewer.open();

    const mainFallback = viewer.featured.getByTestId('image-fallback');
    await expect(mainFallback).toBeVisible();
    await expect(mainFallback).toHaveAccessibleName(MAIN_DOG.breed);
    await expect(viewer.mainBreed).toHaveText(MAIN_DOG.breed);

    await expect(viewer.thumbnail('Pug').getByTestId('image-fallback')).toHaveText(
      'Image unavailable',
    );

    // Picking a working image recovers the main view.
    const husky = byBreed('Husky');
    await viewer.thumbnail(husky.breed).click();
    await viewer.expectMainDog(husky.breed, husky.url);
    await expect(mainFallback).toHaveCount(0);
  });

  test('the dogs stay the same when the window regains focus', async ({ viewer, page, dogApi }) => {
    await viewer.open();

    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
    expect(dogApi.requests).toEqual({ randomDog: 1, randomDogs: 1 });
  });
});
