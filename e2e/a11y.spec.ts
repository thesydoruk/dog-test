import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoViolations(page: Page) {
  // Legacy mode runs axe in the page itself. The default mode opens an extra blank page
  // to merge frame results, which is very slow in Firefox, and the app has no iframes.
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .setLegacyMode()
    .analyze();
  expect(
    violations.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((n) => n.target) })),
  ).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`Accessibility (${colorScheme} theme)`, () => {
    test.use({ colorScheme });

    test('the loaded page has no WCAG violations', async ({ viewer, page }) => {
      await viewer.open();
      await expectNoViolations(page);
    });

    test('the page with favorites and a selection has no WCAG violations', async ({
      viewer,
      page,
    }) => {
      await viewer.open();
      await viewer.favoriteToggle.click();
      await viewer.thumbnail('Pug').click();
      await viewer.favoriteToggle.click();
      await viewer.thumbnail('Pug').hover();
      await expectNoViolations(page);
    });

    test('the error states have no WCAG violations', async ({ viewer, dogApi, page }) => {
      dogApi.setRandomDog('error');
      dogApi.setRandomDogs('error');
      await viewer.goto();
      await expect(page.getByRole('alert')).toHaveCount(2);
      await expectNoViolations(page);
    });

    test('the loading state has no WCAG violations', async ({ viewer, dogApi, page }) => {
      const release = dogApi.holdResponses();
      await viewer.goto();
      await expect(page.getByRole('status')).toHaveCount(2);
      await expectNoViolations(page);
      release();
    });
  });
}

test('the page has a sensible landmark and heading structure', async ({ viewer, page }) => {
  await viewer.open();

  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('complementary')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dog Viewer');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Featured dog',
    'More dogs',
    /^Favorites/,
  ]);
  await expect(page).toHaveTitle('Dog Viewer');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('keyboard focus is clearly visible', async ({ viewer, page }) => {
  await viewer.open();
  await viewer.thumbnail('Pug').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');

  const outline = await viewer
    .thumbnail('Pug')
    .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe('none');
});
