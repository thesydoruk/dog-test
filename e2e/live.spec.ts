import { expect, test } from '@playwright/test';
import { DogViewerPage } from './support/DogViewerPage';

// Smoke test against the real Dog API. Excluded from `npm run test:e2e`; run with
// `npm run test:e2e:live`.
test('works against the real Dog API @live', async ({ page }) => {
  const viewer = new DogViewerPage(page);
  await viewer.open();

  await expect(viewer.mainBreed).not.toHaveText('');
  await expect
    .poll(() => viewer.mainImage.evaluate((img: HTMLImageElement) => img.naturalWidth), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  const firstBreed = (await viewer.thumbnails.first().textContent())!;
  await viewer.thumbnails.first().click();
  await expect(viewer.mainBreed).toHaveText(firstBreed);

  await viewer.favoriteToggle.click();
  await expect(viewer.favoriteItems).toHaveCount(1);
});
