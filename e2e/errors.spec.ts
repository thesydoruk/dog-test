import { byBreed, MAIN_DOG } from './support/fixtures';
import { expect, test } from './support/test';

test.describe('API errors', () => {
  test('a failed main dog shows an error that can be retried', async ({ viewer, dogApi }) => {
    dogApi.setRandomDog('error');
    await viewer.goto();

    const alert = viewer.featured.getByRole('alert');
    await expect(alert).toContainText("We couldn't fetch a dog right now.");
    // The rest of the page keeps working.
    await expect(viewer.thumbnails).toHaveCount(10);
    await expect(viewer.favorites).toBeVisible();

    dogApi.setRandomDog('success');
    await alert.getByRole('button', { name: 'Try again' }).click();

    await expect(alert).toHaveCount(0);
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
  });

  test('a thumbnail can still be shown while the main dog failed', async ({ viewer, dogApi }) => {
    dogApi.setRandomDog('error');
    await viewer.goto();
    await expect(viewer.featured.getByRole('alert')).toBeVisible();

    const pug = byBreed('Pug');
    await viewer.pickThumbnail(pug.breed);

    await expect(viewer.featured.getByRole('alert')).toHaveCount(0);
    await viewer.expectMainDog(pug.breed, pug.url);
    await viewer.favoriteToggle.click();
    await expect(viewer.favoriteItems).toHaveText([pug.breed]);
  });

  test('failed thumbnails show an error that can be retried', async ({ viewer, dogApi }) => {
    dogApi.setRandomDogs('error');
    await viewer.goto();

    const alert = viewer.moreDogs.getByRole('alert');
    await expect(alert).toContainText("We couldn't fetch more dogs.");
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);

    dogApi.setRandomDogs('success');
    await alert.getByRole('button', { name: 'Try again' }).click();

    await expect(alert).toHaveCount(0);
    await expect(viewer.thumbnails).toHaveCount(10);
  });

  test('a failed request is retried once before showing an error', async ({ viewer, dogApi }) => {
    dogApi.setRandomDog('error');
    await viewer.goto();

    await expect(viewer.featured.getByRole('alert')).toBeVisible();
    expect(dogApi.requests.randomDog).toBe(2);
  });

  test('favorites stay available when the API is down', async ({ viewer, dogApi, page }) => {
    await viewer.open();
    await viewer.favoriteToggle.click();

    dogApi.setRandomDog('error');
    dogApi.setRandomDogs('error');
    await page.reload();

    await expect(viewer.featured.getByRole('alert')).toBeVisible();
    await expect(viewer.moreDogs.getByRole('alert')).toBeVisible();

    await viewer.pickFavorite(MAIN_DOG.breed);
    await viewer.expectMainDog(MAIN_DOG.breed, MAIN_DOG.url);
  });
});
